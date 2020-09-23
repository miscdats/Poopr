const AWS = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION})
const ddb = new AWS.DynamoDB()

exports.handler = async (event) => {
  // console.log(JSON.stringify(event, null, 0))

  if (!event.queryStringParameters) {
    return {
      statusCode: 422,
      body: JSON.stringify("Missing parameters")
    }
  }

  const hashKey = event.queryStringParameters.hk.toString()
  const rangeKey = event.queryStringParameters.rk

  const params = {
    TableName: process.env.TableName,
    KeyConditionExpression: 'hashKey = :hk and rangeKey = :rk',
    ExpressionAttributeValues: {
      ':hk': {"N": hashKey},
      ':rk': {"S": rangeKey}
    }
  }

  try {
    return {
      statusCode: 200,
      body: JSON.stringify((await ddb.query(params).promise()).Items[0])
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    }
  }
}