// Mock event
const event = require('./localTestEvent')

// Mock environment variables
process.env.AWS_REGION = 'us-west-2'
process.env.localTest = true
process.env.TableName = 'poopr-httpAPIs-AnswersTable-13KLZPS0W37XT'
process.env.StarQueueURL = 'https://sqs.us-west-2.amazonaws.com/515804667357/poopr-StarAnswersQueue-PT9PF1XJSF8P'
process.env.GeoQueueURL = 'https://sqs.us-west-2.amazonaws.com/515804667357/poopr-GeoAnswersQueue-MEO92AVQ7PAF'

// Lambda handler
const { handler } = require('./post')

const main = async () => {
  console.time('localTest')
  console.dir(await handler(event))
  console.timeEnd('localTest')
}

main().catch(error => console.error(error))