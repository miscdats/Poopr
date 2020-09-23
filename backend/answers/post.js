const AWS = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION})
const sqs = new AWS.SQS()

exports.handler = async (event) => {
  console.log(JSON.stringify(event, null, 0))

  if (!event.body) {
    return {
      statusCode: 422,
      body: JSON.stringify("Missing body")
    }
  }

  const JSONbody = JSON.parse(event.body)
  const QueueUrl = (JSONbody.question.type === 'Geo' ? process.env.GeoQueueURL : process.env.StarQueueURL)

  const body = {
    uid: event.requestContext.authorizer.jwt.claims.sub,
    created: event.requestContext.timeEpoch,
    body: event.body
  }

  console.log('Body: ', body)
  console.log('QueueUrl: ', QueueUrl)

  try {
    const result = await sqs.sendMessage({
      QueueUrl,
      MessageBody: JSON.stringify(body),
    }).promise()
    
    console.log(result)
    return {
      statusCode: 200,
      body: JSON.stringify("Seek sent.")      
    }
  } catch (err) {
    console.error('Error: ', err)
    console.error('Event: ', JSON.stringify(event, null, 0))

    return {
      statusCode: 500,
      body: JSON.stringify("Seek not sent.")
    }
  }
}