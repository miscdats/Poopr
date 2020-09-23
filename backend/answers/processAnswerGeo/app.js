'use strict'

const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION
const docClient = new AWS.DynamoDB.DocumentClient() 
const geohash = require("ngeohash")
const precision = 6

// The standard Lambda handler
exports.handler = async (event) => {
  // console.log (JSON.stringify(event, null, 2))

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        const message = JSON.parse(record.body)
        console.log(message)
        await processMessage(message)
      } catch (err) {
        console.error(`Handler error: ${err}`)
      }
    })
  )
}

// Find geohash and save to DDB
const processMessage = async (message) => {
  console.log(message)
  try {
    const body = JSON.parse(message.body)

    const params = {
      TableName: process.env.TableName,
      Item: {
        PK: body.question.rangeKey,
        SK: message.uid,
        latitude: body.question.latitude,
        longitude: body.question.longitude,
        lastUpdated: Date.now(),
        value: geohash.encode(body.lat, body.lng, precision),
        type: 'Geo'
      }
    }

    // Save to DDB 
    const result = await docClient.put(params).promise()
    console.log(result)

  } catch (err) {
    console.error(`Error: ${err}`)
  }
}