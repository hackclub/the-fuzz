// pull ENV variables
require('dotenv').config()
import '@babel/polyfill';
import * as util from './util'
import * as chrono from 'chrono-node'

const { createEventAdapter } = require('@slack/events-api')
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET
const slackEvents = createEventAdapter(slackSigningSecret)
const port = process.env.PORT || 3000

slackEvents.on('channel_created', async event => {
  let channelId = event.channel.id

  // bot should be in every public channel
  await util.joinChannel(channelId)
})

slackEvents.on('channel_left', async event => {
  let channelId = event.channel

  // the bot is everpresent and is not allowed to leave channels
  await util.joinChannel(channelId)
})

slackEvents.on('member_joined_channel', async event => {
  // get punishments of member
  let punishments = await util.getActivePunishmentsForSlackUser(
    event.user,
    'channel_ban'
  )
  if (punishments.length == 0) {
    return
  }

  punishments.forEach(async p => {
    // punishment is valid
    if (event.channel == p.fields['Channel ID']) {
      util.removeUserFromChannel(event.user, event.channel)
      // we should send a message here as to why the removal
    }
  })
})

// handles mutes and removal of messages from people who try to get small bits of text out when banned
slackEvents.on('message', async event => {
  if (event.user == undefined) {
    return
  }

  if (event.channel_type == 'im') {
    let isAdmin = await util.slackUserIsAdmin(event.user)
    if (!isAdmin) {
      util.sendPm(event.user, '🕶️')
      return
    }

    let message = event.text
    if (message.startsWith('mute')) {
      // mute @name for 20 minutes because they were being a jerk
      let user = new RegExp(/(?<=mute\s).*.+?(?=\sfor)/)
        .exec(message)[0]
        .replace('<@', '')
        .replace('>', '')
      let time = new RegExp(/(?<=for\s).*.+?(?=\sbecause)/).exec(message)[0]
      let reason = new RegExp(/(?<=because\s).*/).exec(message)[0]

      util.sendPm(
        event.user,
        'Muting <@' +
          user +
          '> globally for ' +
          time +
          ' because ' +
          reason +
          '...'
      )
      util.muteUserInSlack(event.user, user, reason, time)
      util.sendPm(event.user, '<@' + user + '>' + ' has been muted globally!')

      util.sendPm(
        user,
        'You have been muted globally for reason: ' +
          reason +
          ". Please contact someone in @staff if you have any questions. You'll be good to go again in " +
          time
      )
    } else if (message.startsWith('channel mute')) {
      // channel mute @name in #channel for 20 minutes because they were being a jerk
      let user = new RegExp(/(?<=mute\s).*.+?(?=\sin)/)
        .exec(message)[0]
        .replace('<@', '')
        .replace('>', '')
      let channel = new RegExp(/(?<=in\s).*.+?(?=\sfor)/)
        .exec(message)[0]
        .match(/(?<=\#)(.*?)(?=\|)/)[0]
      let time = new RegExp(/(?<=for\s).*.+?(?=\sbecause)/).exec(message)[0]
      let reason = new RegExp(/(?<=because\s).*/).exec(message)[0]

      util.sendPm(
        event.user,
        'Muting <@' +
          user +
          '> in <#' +
          channel +
          '> for ' +
          time +
          ' because ' +
          reason +
          '...'
      )
      util.muteUserInChannel(event.user, user, channel, reason, time)
      util.sendPm(
        event.user,
        '<@' + user + '> has been muted for ' + time + ' in <#' + channel + '>!'
      )

      util.sendPm(
        user,
        'You have been muted in <#' +
          channel +
          '> for ' +
          time +
          ' for reason: ' +
          reason +
          ". Please contact someone in @staff if you have any questions. You'll be good to go again in " +
          time
      )
    } else if (message.startsWith('ban')) {
      // ban @name from #channel for 20 minutes because they were a jerk
      let user = new RegExp(/(?<=ban\s).*.+?(?=\sfrom)/)
        .exec(message)[0]
        .replace('<@', '')
        .replace('>', '')
      let channel = new RegExp(/(?<=from\s).*.+?(?=\sfor)/)
        .exec(message)[0]
        .match(/(?<=\#)(.*?)(?=\|)/)[0]
      let time = new RegExp(/(?<=for\s).*.+?(?=\sbecause)/).exec(message)[0]
      let reason = new RegExp(/(?<=because\s).*/).exec(message)[0]

      util.sendPm(
        event.user,
        'Banning <@' +
          user +
          '> from <#' +
          channel +
          '> for ' +
          time +
          ' because ' +
          reason +
          '...'
      )

      util.removeUserFromChannel(user, channel)
      util.banUserFromChannel(event.user, user, channel, reason, time)

      util.sendPm(
        '<@' +
          user +
          '> has been banned from <#' +
          channel +
          '> for ' +
          time +
          '!'
      )
      util.sendPm(
        user,
        'You have been banned from <#' +
          channel +
          '> for ' +
          time +
          ' for reason: ' +
          reason +
          ". Please contact someone in @staff if you have any questions. You'll be good to go again in " +
          time
      )
    }
  }

  // punishment logic below
  // we don't want these because they don't have users
  if (
    event.subtype == 'message_deleted' ||
    event.subtype == 'message_changed'
  ) {
    return
  }

  let punishments = await util.getActivePunishmentsForSlackUser(
    event.user,
    'all'
  )

  if (punishments.length == 0) {
    return
  }

  punishments.forEach(async p => {
    if (
      (p.fields['Type'] == 'channel_ban' ||
        p.fields['Type'] == 'channel_mute') &&
      event.channel == p.fields['Channel ID']
    ) {
      util.deleteMessage(event.channel, event.ts)
    }

    if (p.fields['Type'] == 'full_mute') {
      util.deleteMessage(event.channel, event.ts)
    }
  })
})

;(async () => {
  const server = await slackEvents.start(port)
  console.log(`Listening for events on ${server.address().port}`)
  // let punishments = await util.getActivePunishmentsForSlackUser('UE8DH0UHM', 'channel_ban')
  // console.log(punishments)
})()
