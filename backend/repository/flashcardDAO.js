const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { s3, BUCKET_NAME, getSignedUrl, client, TABLE_NAME } = require("../util/awsClient");
const AWS = require('aws-sdk');
const logger = require("../util/logger");

const documentClient = DynamoDBDocumentClient.from(client);
const s3Client = new AWS.S3();

async function saveFlashcardSetMetadata(userId, setId, setName) {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      user_id: `${userId}`,
      sort_key: `SET#${setId}`,
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

async function saveFlashcardSetToS3(userId, setId, flashcardSetName, flashcardSetJson) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `flashcards/${userId}/${flashcardSetName}/${setId}.json`,
    Body: flashcardSetJson,
  };

  try {
    await s3Client.putObject(params).promise();
    logger.info(`Flashcard set file saved to S3 at ${params.Key}`);
  } catch (err) {
    logger.error(`Failed to save flashcard set to S3 at ${params.Key}`, err);
    throw err;
  }
}

async function getAllFlashcardSets(userId) {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: `flashcards/${userId}/`,
    Delimiter: '/'
  };

  try {
    const result = await s3Client.listObjectsV2(params).promise();

    const folderNames = result.CommonPrefixes.map(cp => {
      const fullPrefix = cp.Prefix;
      const parts = fullPrefix.split('/');
      return parts[parts.length - 2];
    });

    logger.info(`Fetched flashcard set names for user ${userId}: ${folderNames.join(', ')}`);
    return folderNames;
  } catch (err) {
    logger.error(`Failed to retrieve flashcard sets for user ${userId}`, err);
    return false;
  }
}

async function getDetailedSet(userId, setId) {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: `flashcards/${userId}/${setId}/`
  };

  try {
    const result = await s3Client.listObjectsV2(params).promise();
    logger.info(`Fetched detailed contents of set ${setId} for user ${userId}`);
    return result.Contents;
  } catch (err) {
    logger.error(`Failed to find detailed contents for set ${setId} and user ${userId}`, err);
    return false;
  }
}

async function getSetById(userId, selectedSet, setId) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `flashcards/${userId}/${selectedSet}/${setId}.json`
  };

  try {
    const result = await s3Client.getObject(params).promise();
    const jsonData = JSON.parse(result.Body.toString('utf-8'));
    logger.info(`Successfully retrieved flashcard set ${setId} (${selectedSet}) for user ${userId}`);
    return jsonData;
  } catch (err) {
    logger.error(`Failed to retrieve flashcard set ${setId} (${selectedSet}) for user ${userId}`, err);
    return false;
  }
}

module.exports = {
  saveFlashcardSetMetadata,
  saveFlashcardSetToS3,
  getAllFlashcardSets,
  getDetailedSet,
  getSetById
};
