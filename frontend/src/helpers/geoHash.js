'use strict'

const { S2Cell, S2LatLng } = require('nodes2ts')

// Uses the same library as the NPM DynamoDB Geohash package
// to generate the cell ID for subscription.

const getGeoHashCell = (lat, lng, length) => {
 
  const generateGeohash = (lat, lng) => {
    const latLng = S2LatLng.fromDegrees(lat, lng)
    const cell = S2Cell.fromLatLng(latLng)
    const cellId = cell.id
    return cellId.id
  }

  const generateHashKey = (geohash, hashKeyLength) => {
    if (geohash.lessThan(0)) {
      // Counteract "-" at beginning of geohash.
      hashKeyLength++;
    }

    const geohashString = geohash.toString(10)
    const denominator = Math.pow(10, geohashString.length - hashKeyLength)
    return geohash.divide(denominator)
  }

  const gh = generateGeohash(lat, lng)
  const hashKey = generateHashKey(gh, length)
  return (hashKey.toString(10))
}

module.exports = { getGeoHashCell }

