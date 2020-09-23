// Mock event
const event = require('./localTestEvent')

// Mock environment variables
process.env.AWS_REGION = 'us-west-2'
process.env.localTest = true
process.env.IOT_DATA_ENDPOINT = 'ai4m81gweyn4a-ats.iot.us-west-2.amazonaws.com'

// Lambda handler
const { handler } = require('./app')

const main = async () => {
  console.time('localTest')
  await handler(event)
  console.timeEnd('localTest')
}

main().catch(error => console.error(error))
