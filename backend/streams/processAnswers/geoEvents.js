const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION

const ddb = new AWS.DynamoDB() 
const ddbGeo = require('dynamodb-geo')

// Configuring dynamodb-geo library
const config = new ddbGeo.GeoDataManagerConfiguration(ddb, process.env.TableName)
config.hashKeyLength = 5
const myGeoTableManager = new ddbGeo.GeoDataManager(config)

// Since a stream can contain multiple updates,
// aggregate these first before applying to the
// underlying table.

const aggregateUpdates = (event) => {
  // Helper function to aggregate updates by ID
  const saveUpdate = (update) => {

    const key = `${update.ID}/${update.geohash}`

    if(updates[key]) {
      // Update existing
      updates[key].deltaAnswers = updates[key].deltaAnswers += update.deltaAnswers
    } else {
      // Add new
      updates[key] = {
        ID: update.ID,
        geohash: update.geohash,
        deltaAnswers: update.deltaAnswers,
        lat: update.lat,
        lng: update.lng      
      }
    }
  }
 
  let updates = {}
  // Iterate records in the stream batch
  event.map((event) => {
    let NewImage = event.dynamodb.NewImage
    let OldImage = event.dynamodb.OldImage    

    // New answer
    if (event.eventName === 'INSERT') {
      saveUpdate({
        ID: NewImage.PK.S,
        geohash: NewImage.value.S, 
        deltaAnswers: 1,
        lat: NewImage.latitude.N,
        lng: NewImage.longitude.N        
      })
    }

    // Changed answer
    if (event.eventName === 'MODIFY') {
      saveUpdate({
        ID: NewImage.PK.S,
        geohash: NewImage.value.S, 
        deltaAnswers: 1,
        lat: NewImage.latitude.N,
        lng: NewImage.longitude.N        
      })
      saveUpdate({
        ID: OldImage.PK.S,
        geohash: OldImage.value.S, 
        deltaAnswers: -1,
        lat: OldImage.latitude.N,
        lng: OldImage.longitude.N        
      })
    }

    // Deleted answer
    if (event.eventName === 'REMOVE') {
      saveUpdate({
        ID: OldImage.PK.S,
        geohash: OldImage.value.S, 
        deltaAnswers: -1,
        lat: OldImage.latitude.N,
        lng: OldImage.longitude.N        
      })
    }
    console.log(updates)
  })

  return updates
}

// Uses the dynamodb-geo library to update
// existing table items
const updateSeeksTable = async (updates) => {
  for (const update in updates) {
    let item = updates[update]

    console.log('Updating: ', item)

    const params = {
      RangeKeyValue: { S: item.ID }, 
      GeoPoint: {
        latitude: item.lat,
        longitude: item.lng
      },
      UpdateItemInput: {
        UpdateExpression: `ADD ${item.geohash} :deltaAnswers, answers :deltaAnswers`,
        ExpressionAttributeValues: {
          ':deltaAnswers': { N: item.deltaAnswers.toString() }          
        }
      }
    }

    console.log(JSON.stringify(params, null, 0))

    const result = await myGeoTableManager.updatePoint(params).promise()
    console.log(result)
  }
}

module.exports = {
  aggregateUpdates,
  updateSeeksTable
}