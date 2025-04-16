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


async function getExamSet(setName, userId){
    const params = {
        Bucket: BUCKET_NAME,
        Prefix: `exams/${userId}/${setName}`
    }

    try{
        const data = await s3Client.listObjectsV2(params).promise();
        return data.Contents;
    }catch(err){
        logger.error(`Failed to retrieve exam set ${params.Key}`, err);
        throw err;
    }
}

async function assignExam(examSet, examId, teacherId, studentId) {
    const getParams = {
      Bucket: BUCKET_NAME,
      Key: `exams/${teacherId}/${examSet}/${examId}.json`
    };
  
    try {
      await s3Client.getObject(getParams).promise();

      const copyParams = {
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/exams/${teacherId}/${examSet}/${examId}.json`,
        Key: `assigned-exams/${studentId}/${examSet}/${examId}.json`
      }

      const result = await s3Client.copyObject(copyParams).promise();
      return result;
    } catch (err) {
      logger.error(`Failed to assign exam set from S3 at ${getParams.Key}`, err);
      throw err;
    }
}

module.exports = {
    saveExamSetMetadata,
    saveExamSetToS3,
    getExamSetFromS3,
    getExamSet,
    assignExam
  };
  