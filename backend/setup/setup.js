'use strict'

// Run this script with your AWS region as the first parameter
// e.g. node ./setup.js us-west-2

const AWS = require('aws-sdk')
AWS.config.update({region: process.argv[2]})

const ddb = new AWS.DynamoDB() 
const ddbGeo = require('dynamodb-geo')

// Configuring constants
const DDB_TABLENAME = 'pooprSeeks'
const config = new ddbGeo.GeoDataManagerConfiguration(ddb, DDB_TABLENAME)
config.hashKeyLength = 5

// Use GeoTableUtil to help construct a CreateTableInput.
const createTableInput = ddbGeo.GeoTableUtil.getCreateTableRequest(config)

// Tweak the schema as desired
delete createTableInput.ProvisionedThroughput
createTableInput.BillingMode = 'PAY_PER_REQUEST'
createTableInput.StreamSpecification = {
  StreamEnabled: true,
  StreamViewType: 'NEW_AND_OLD_IMAGES'
}

console.log('Creating table with schema:')
console.dir(createTableInput, { depth: null })

// Create the table
ddb.createTable(createTableInput).promise()
  // Wait for it to become ready
  .then(function () { return ddb.waitFor('tableExists', { TableName: config.tableName }).promise() })
  .then(function () { console.log('Table created and ready!') })

