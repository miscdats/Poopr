const AWS = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION})

const ddb = new AWS.DynamoDB.DocumentClient() 

exports.handler = async (event) => {
  console.log(JSON.stringify(event, null, 0))

  if (!event.queryStringParameters) {
    return {
      statusCode: 422,
      body: JSON.stringify("Missing parameters")
    }
  }

  const PK = event.queryStringParameters.ID
  const SK = event.queryStringParameters.author

  const params = {
    TableName: process.env.TableName,
    Key:{
        "PK": PK,
        "SK": SK
    }
  }

  console.log(params)
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(await ddb.delete(params).promise())
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    }
  }

}