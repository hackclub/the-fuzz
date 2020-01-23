import Bottleneck from 'bottleneck'
import Airtable from 'airtable'
require('dotenv').config()

const bases = {}

bases.moderation = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.MODERATION_BASE
)

const airtableRatelimiter = new Bottleneck({
  // maxConcurrent: 5,
  minTime: 200,
})

export const airPatch = (tableName, recordID, values, options = {}) =>
  airtableRatelimiter.schedule(
    { priority: options.priority || 5 },
    () =>
      new Promise((resolve, reject) => {
        const timestamp = Date.now()
        // console.log(
        //   `I'm asking Airtable to patch ${recordID} record in ${tableName} base at ${timestamp} with the new values: ${JSON.stringify(
        //     values
        //   )}`
        // )
        const base = bases[options.base || 'operations']
        base(tableName).update(recordID, values, (err, record) => {
          if (err) {
            console.error(err)
            reject(err)
          }
          // console.log(
          //   `Airtable updated my ${tableName} record from ${timestamp} in ${Date.now() -
          //     timestamp}ms`
          // )
          resolve(record)
        })
      })
  )

export const airCreate = (tableName, fields, options = {}) =>
  airtableRatelimiter.schedule(
    { priority: options.priority || 5 },
    () =>
      new Promise((resolve, reject) => {
        const timestamp = Date.now()
        // console.log(
        //   `I'm asking Airtable to create a new record in the ${tableName} base at ${timestamp}`
        // )
        const base = bases[options.base || 'moderation']
        base(tableName).create(fields, (err, record) => {
          if (err) {
            console.error(err)
            reject(err)
          }
          if (!record) {
            reject(new Error('Record not created'))
          }
          // console.log(
          //   `Airtable saved my ${tableName} record from ${timestamp} in ${Date.now() -
          //     timestamp}ms`
          // )
          resolve(record)
        })
      })
  )

export const airFind = async (tableName, fieldName, value, options = {}) => {
  // see airGet() for usage

  // note: we're not using a rate-limiter here b/c it's just a wrapper
  // function for airGet, which is already rate-limited
  const records = await airGet(tableName, fieldName, value, {
    ...options,
    selectBy: { ...options.selectBy, maxRecords: 1 },
  })
  return (records || [])[0]
}

export const airGet = (
  tableName,
  searchArg = null,
  tertiaryArg = null,
  options = {}
) =>
  airtableRatelimiter.schedule(
    { priority: options.priority || 5 },
    () =>
      new Promise((resolve, reject) => {
        // usage:
        // for key/value lookup: `airGet('Clubs', 'Slack Channel ID', slackChannelID)`
        // for formula lookup: `airGet('Clubs', '{Slack Channel ID} = BLANK()')`
        // for all records: `airGet('People')`

        const timestamp = Date.now()

        const selectBy = options.selectBy || {}
        if (searchArg === null) {
          // console.log(
          //   `I'm asking AirTable to send me ALL records in the "${tableName}" base. The timestamp is ${timestamp}`
          // )
        } else {
          if (tertiaryArg) {
            // this is a key/value lookup
            selectBy.filterByFormula = `{${searchArg}} = "${tertiaryArg}"`
          } else {
            // this is a formula lookup
            selectBy.filterByFormula = searchArg
          }

          // console.log(
          //   `I wrote a query & sent it to AirTable with a timestamp of ${timestamp}: BASE=\`${tableName}\` FILTER=\`${selectBy.filterByFormula}\``
          // )
        }

        const base = bases[options.base || 'moderation']
        base(tableName)
          .select(selectBy)
          .all((err, data) => {
            if (err) {
              console.error(err)
              reject(err)
            }
            // console.log(
            //   `AirTable got back to me from my question at ${timestamp} with ${
            //     data.length
            //   } records. The query took ${Date.now() - timestamp}ms`
            // )
            resolve(data)
          })
      })
  )
