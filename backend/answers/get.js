const AWS = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION})

const ddb = new AWS.DynamoDB.DocumentClient() 

exports.handler = async (event) => {
  console.log(JSON.stringify(event, null, 0))

  const params = {
    TableName: process.env.TableName,
    KeyConditionExpression: 'PK = :ID',
    ExpressionAttributeValues: {
      ':ID': event.pathParameters.Key
    }
  }

  console.log(params)
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(await ddb.query(params).promise())
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    }
  }

}