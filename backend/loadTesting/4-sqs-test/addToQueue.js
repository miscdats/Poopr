const AWS = require('aws-sdk')
AWS.config.update({region: 'us-west-2'})
const sqs = new AWS.SQS()

const BATCH_SIZE = 10
const TOTAL_RUNS = 10
const QueueUrl = '<<ENTER YOUR QUEUE URL>>'

// Sets a bounding box around a test area
const bounds = {
  latMax: 43.0359297, 
  latMin: 43.023663,
  lngMax: -70.8275303,
  lngMin: -70.823701,
}

const generateLocation = () => {
  const randomLat = ((bounds.latMax-bounds.latMin) * Math.random()) + bounds.latMin
  const randomLng = ((bounds.lngMax-bounds.lngMin) * Math.random()) + bounds.lngMin

  return {
    lat: randomLat,
    lng: randomLng
  }
}

const addToQueue = async () => {
  for (let j = 0; j < TOTAL_RUNS; j++ ) {
    let params = {
      Entries: [],
      QueueUrl
    }
    for (let i = 0; i < BATCH_SIZE; i++) {
      const uid = `fakeID-${parseInt(Math.random()*100000000)}`
      const fakeLoc = generateLocation()

      params.Entries.push ({
        Id: uid,
        MessageBody: JSON.stringify({
          uid,
          created: Date.now(),
          body: JSON.stringify({
            "seek": {
              "seek": "Geography seek",
              "created": "1588158707766",
              "state": "open",
              "type": "Geo",
              "latitude": 43.0385863,
              "longitude": -70.8238758,
              "rangeKey": "twitter|2571128502-1588158707766",
              "hashKey": "-85109",
              "answers": "1",
              "avgScore": 0,
              "author": "twitter|2571128502"
            },
            "type": "geo",
            "lat": fakeLoc.lat,
            "lng": fakeLoc.lng
          })
        })
      })
    }
    const result = await sqs.sendMessageBatch(params).promise()
    console.log(result)
  }
}

const main = async () => (await addToQueue())

console.timeStamp('test')
main()
console.timeEnd('test')
