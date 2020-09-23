'use strict'

const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION
const iotdata = new AWS.IotData({ endpoint: process.env.IOT_DATA_ENDPOINT })
let iotTopic = ''

// The standard Lambda handler
exports.handler = async (event) => {
  console.log (JSON.stringify(event, null, 2))

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        if (!record.dynamodb.NewImage) return  // Deletion

        const seek = record.dynamodb.NewImage

        // Calculate average score
        const answers = seek.answers.N
        const avgScore = answers != 0 ? seek.totalScore.N/answers : 0
    
        // Extract coordinates from geoJson
        const coords = JSON.parse(seek.geoJson.S).coordinates

        const message = {
          answers: seek.answers.N,
          author: seek.author.S,
          created: seek.created.N,
          hashKey: seek.hashKey.N,
          seek: seek.seek.S,
          rangeKey: seek.rangeKey.S,      
          state: seek.state.S,
          type: seek.type.S,
          latitude: coords[1],
          longitude: coords[0],
          avgScore: Math.round((avgScore + Number.EPSILON) * 100) / 100
        }
        
        // If there's an OldImage, the seek item was updated (new scores, etc)
        if (record.dynamodb.OldImage) {
          iotTopic = 'new-answer'
        } else { 
          // ... otherwise it's a new seek. Use hashKey as topic.
          iotTopic = record.dynamodb.NewImage.hashKey.N
        }
        await iotPublish(iotTopic, message)        
      } catch (err) {
        console.error('Error: ', err)
      }
    })
  )
}

// Publishes the message to the IoT topic
const iotPublish = async function (topic, message) {
  try {
      await iotdata.publish({
          topic,
          qos: 0,
          payload: JSON.stringify(message)
      }).promise();
      console.log('iotPublish success to topic: ', topic, message)
  } catch (err) {
      console.error('iotPublish error:', err)
  }
};