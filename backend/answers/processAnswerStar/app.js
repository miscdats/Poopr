'use strict'

const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION
const docClient = new AWS.DynamoDB.DocumentClient() 

// The standard Lambda handler
exports.handler = async (event) => {
  console.log (JSON.stringify(event, null, 2))

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        const message = JSON.parse(record.body)
        await saveToDDB(message)
      } catch (err) {
        console.error(`Handler error: ${err}`)
      }
    })
  )
}

// Save single item to DynamoDB
const saveToDDB = async (message) => {
  console.log(message)
  try {
    const body = JSON.parse(message.body)

    const params = {
      TableName: process.env.TableName,
      Item: {
        PK: body.seek.rangeKey,
        SK: message.uid,
        latitude: body.seek.latitude,
        longitude: body.seek.longitude,
        lastUpdated: Date.now(),
        value: body.rating,
        type: 'Star'
      }
    }

    // Save to DDB 
    const result = await docClient.put(params).promise()
    console.log(result)

  } catch (err) {
    console.error(`Error: ${err}`)
  }
}