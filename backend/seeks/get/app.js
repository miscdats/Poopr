const AWS = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION})

const ddb = new AWS.DynamoDB() 
const ddbGeo = require('dynamodb-geo')
const config = new ddbGeo.GeoDataManagerConfiguration(ddb, process.env.TableName)
config.hashKeyLength = 5

const myGeoTableManager = new ddbGeo.GeoDataManager(config)
const SEARCH_RADIUS_METERS = 8000

exports.handler = async (event) => {
  // console.log(JSON.stringify(event, null, 0))

  if (!event.queryStringParameters) {
    return {
      statusCode: 422,
      body: JSON.stringify("Missing parameters")
    }
  }

  const latitude = parseFloat(event.queryStringParameters.lat)
  const longitude = parseFloat(event.queryStringParameters.lng)

  console.log(`Searching for: ${latitude}, ${longitude} with ${SEARCH_RADIUS_METERS} radius`)

  // Get seeks within geo range
  const result = await myGeoTableManager.queryRadius({
    RadiusInMeter: SEARCH_RADIUS_METERS,
    CenterPoint: {
      latitude,
      longitude
    }
  })

  console.log('Result: ', result)

  // Reformat output, add avg scores
  const seeks = result.map((seek) => {

    const answers = seek.answers.N
    const avgScore = answers != 0 ? seek.totalScore.N/answers : 0

    // Extract coordinates from geoJson
    const coords = JSON.parse(seek.geoJson.S).coordinates
    const longitude = coords[0]
    const latitude = coords[1]

    return {
      seek: seek.seek.S,
      created: seek.created.N,
      state: seek.state.S,
      type: seek.type.S,
      latitude,
      longitude,
      rangeKey: seek.rangeKey.S,      
      hashKey: seek.hashKey.N,
      answers: seek.answers.N,
      avgScore: Math.round((avgScore + Number.EPSILON) * 100) / 100,
      author: seek.author.S
    }
  })

  console.log('Returning seeks: ', seeks)

  return {
    statusCode: 200,
    body: JSON.stringify(seeks)
  }
}