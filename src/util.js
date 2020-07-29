import { WebClient } from '@slack/web-api'
import * as airtable from './airtable-util'
import * as chrono from 'chrono-node'
const NodeCache = require('node-cache')

const punishmentCache = new NodeCache({ stdTTL: 120, checkperiod: 130 })

const token = process.env.SLACK_TOKEN
const web = new WebClient(token, { maxRequestConcurrency: 2 })
const web_admin = new WebClient(process.env.SLACK_LEGACY_TOKEN)

export async function joinChannel(channelId) {
  await web.conversations.join({
    channel: channelId,
  })
}

export async function joinEveryChannel() {
  for await (const page of web.paginate('conversations.list', {
    types: 'public_channel',
    exclude_archived: true,
  })) {
    page.channels
      .filter((c) => c.num_members > 0 && c.is_member == false)
      .forEach(async (c) => {
        let id = c.id

        await joinChannel(id)
      })
  }
}

export async function getNameFromSlackUser(userId) {
  let user = await web.users.info({
    user: userId,
  })

  return user.user.real_name
}

export async function getAirtableRecordForSlackUser(userId) {
  let result = await airtable.airFind('Users', 'Slack ID', userId)
  if (!result) {
    // need to create user
    let user = await web.users.info({
      user: userId,
    })
    let givenName = user.user.real_name

    let record = await airtable.airCreate('Users', {
      'Slack ID': userId,
      'Given Name': givenName,
    })
    return record
  } else {
    return result
  }
}

export async function banUserFromChannel(
  modUserId,
  userId,
  channelId,
  reason,
  time
) {
  // get airtable record for user
  let user = await getAirtableRecordForSlackUser(userId)
  let modName = await getNameFromSlackUser(modUserId)

  // create punishment
  let record = await airtable.airCreate('Punishments', {
    For: [user.id],
    Type: 'channel_ban',
    'Channel ID': channelId,
    'Given At': Date.now(),
    'Valid Until': chrono.parseDate(time + ' from now'),
    Reason: reason,
    'Moderator Name': modName,
  })

  return record
}

export async function muteUserInChannel(
  modUserId,
  userId,
  channelId,
  reason,
  time
) {
  let user = await getAirtableRecordForSlackUser(userId)
  let modName = await getNameFromSlackUser(modUserId)

  // create punishment
  let record = await airtable.airCreate('Punishments', {
    For: [user.id],
    Type: 'channel_mute',
    'Channel ID': channelId,
    'Given At': Date.now(),
    'Valid Until': chrono.parseDate(time + ' from now'),
    Reason: reason,
    'Moderator Name': modName,
  })

  return record
}

export async function muteUserInSlack(modUserId, userId, reason, time) {
  let user = await getAirtableRecordForSlackUser(userId)
  let modName = await getNameFromSlackUser(modUserId)

  // create punishment
  let record = await airtable.airCreate('Punishments', {
    For: [user.id],
    Type: 'full_mute',
    'Given At': Date.now(),
    'Valid Until': chrono.parseDate(time + ' from now'),
    Reason: reason,
    'Moderator Name': modName,
  })

  return record
}

export async function getActivePunishmentsForSlackUser(userId, type) {
  let airtableUser = await getAirtableRecordForSlackUser(userId)

  let records
  let cache

  switch (type) {
    case 'channel_ban':
      cache = getCachedPunishment(userId, 'channel_ban')
      if (cache) {
        records = cache
        break
      }
      records = await airtable.airGet(
        'Punishments',
        'AND({For} = "' +
          userId +
          '", {Type} = "channel_ban", IS_AFTER({Valid Until}, NOW()) = 1)'
      )
      cachePunishment(userId, 'channel_ban', records)
      break
    case 'channel_mute':
      cache = getCachedPunishment(userId, 'channel_mute')
      if (cache) {
        records = cache
        console.log('using cache')
        break
      }
      console.log('not using cache')
      records = await airtable.airGet(
        'Punishments',
        'AND({For} = "' +
          userId +
          '", {Type} = "channel_mute", IS_AFTER({Valid Until}, NOW()) = 1)'
      )
      cachePunishment(userId, 'channel_mute', records)
      break
    case 'full_mute':
      cache = getCachedPunishment(userId, 'full_mute')
      if (cache) {
        records = cache
        break
      }
      records = await airtable.airGet(
        'Punishments',
        'AND({For} = "' +
          userId +
          '", {Type} = "full_mute", IS_AFTER({Valid Until}, NOW()) = 1)'
      )
      cachePunishment(userId, 'full_mute', records)
      break
    default:
      cache = getCachedPunishment(userId, 'all')
      if (cache) {
        records = cache
        console.log('using cache')
        break
      }
      console.log('not cached')
      records = await airtable.airGet(
        'Punishments',
        'AND({For} = "' + userId + '", IS_AFTER({Valid Until}, NOW()) = 1)'
      )
      cachePunishment(userId, 'all', records)
  }

  return records
}

export async function removeUserFromChannel(userId, channelId) {
  await web_admin.conversations.kick({
    channel: channelId,
    user: userId,
  })
}

export async function deleteMessage(channelId, messageTs) {
  await web_admin.chat.delete({
    channel: channelId,
    ts: messageTs,
  })
}

export async function slackUserIsAdmin(userId) {
  let response = await web.users.info({
    user: userId,
  })

  return response.user.is_admin
}

export async function sendPm(userId, message) {
  let response = await web.conversations.open({
    users: userId,
  })

  await web.chat.postMessage({
    channel: response.channel.id,
    text: message,
  })
}

export function cachePunishment(userId, type, data) {
  punishmentCache.set(`${userId}-${type}`, data)
}

export function getCachedPunishment(userId, type) {
  let value = punishmentCache.get(`${userId}-${type}`)

  if (value == undefined) {
    return false
  }

  return value
}
