const star = require('./starEvents')
const geo = require('./geoEvents')

const matchItem = (item, type) => {
  try {
    if (item.dynamodb.NewImage) {
      if (item.dynamodb.NewImage.type.S === type) return true
    }
    if (item.dynamodb.OldImage) {
      if (item.dynamodb.OldImage.type.S === type) return true
    }
  } catch (err) {
    console.error('matchItem error: ', err)
  }
  return false
}

// The standard Lambda handler
exports.handler = async (event) => {
  console.log (JSON.stringify(event, null, 2))

  const starEvents = event.Records.filter((item) => (matchItem(item, 'Star')))
  const geoEvents = event.Records.filter((item) =>  (matchItem(item, 'Geo')))

  console.log('Star events: ', starEvents.length)
  console.log('Geo events: ', geoEvents.length)

  if (starEvents.length > 0) {
    const updates = star.aggregateUpdates(starEvents)
    await star.updateSeeksTable(updates)
  }

  if (geoEvents.length > 0) {
    const updates = geo.aggregateUpdates(geoEvents)
    console.log('Updates: ', updates)
    await geo.updateSeeksTable(updates)
  }

}

