const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { s3, BUCKET_NAME, getSignedUrl, client, TABLE_NAME } = require("../util/awsClient");
const AWS = require('aws-sdk');
const logger = require("../util/logger");

const documentClient = DynamoDBDocumentClient.from(client);
const s3Client = new AWS.S3();

async function saveExamSetMetadata(userId, setId, setName) {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      user_id: `${userId}`,
      sort_key: `EXAMSET#${setId}`,
      setName,
    },
  });

  try {
    await documentClient.send(command);
    logger.info(`Metadata for flashcard set '${setName}' (ID: ${setId}) saved for user ${userId}.`);
  } catch (err) {
    logger.error(`Failed to save metadata for flashcard set '${setName}' (ID: ${setId}) for user ${userId}.`, err);
    throw err;
  }
}

async function saveExamSetToS3(userId, setId, examSetName, examSetJson) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `exams/${userId}/${examSetName}/${setId}.json`,
    Body: examSetJson,
  };

  try {
    await s3Client.putObject(params).promise();
    logger.info(`Flashcard set file saved to S3 at ${params.Key}`);
  } catch (err) {
    logger.error(`Failed to save flashcard set to S3 at ${params.Key}`, err);
    throw err;
  }
}

async function getExamSetFromS3(userId, setId, examSetName) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `exams/${userId}/${examSetName}/${setId}.json`
  };

  try {
    const data = await s3Client.getObject(params).promise();
    return JSON.parse(data.Body.toString());
  } catch (err) {
    logger.error(`Failed to retrieve exam set from S3 at ${params.Key}`, err);
    throw err;
  }
}

module.exports = {
    saveExamSetMetadata,
    saveExamSetToS3,
    getExamSetFromS3
  };
  