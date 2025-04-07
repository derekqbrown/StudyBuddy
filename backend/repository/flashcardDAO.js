const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { s3, BUCKET_NAME, getSignedUrl, client, TABLE_NAME } = require("../util/awsClient");

const AWS = require('aws-sdk'); 

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

  await documentClient.send(command);
}

async function saveFlashcardSetToS3(userId, setId, flashcardSetName, flashcardSetJson) {
  const params = {
    Bucket: BUCKET_NAME, 
    Key: `flashcards/${userId}/${flashcardSetName}/${setId}.json`,
    Body: flashcardSetJson,
  };

  await s3Client.putObject(params).promise();
}


async function getAllFlashcardSets(userId) {
  const params = ({
    Bucket: BUCKET_NAME,
    Prefix: `flashcards/${userId}/`,
    Delimiter: '/'
  });

  try{
    const result = await s3Client.listObjectsV2(params).promise();

    const folderNames = result.CommonPrefixes.map(cp => {
      const fullPrefix = cp.Prefix; 
      const parts = fullPrefix.split('/');
      return parts[parts.length - 2];
    });

    console.log("Flashcard sets:", folderNames);
    return folderNames;
  }
  catch(err){
    console.error("Failed to retrieve fashcard sets!", err);
    return false;
  }
}


async function getDetailedSet(userId, setId){
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: `flashcards/${userId}/${setId}/`
  };

  try{
    const result = await s3Client.listObjectsV2(params).promise();

    console.log(result.Contents);

    return result.Contents;
  }
  catch(err){
    console.error("Failed to find set!", err);
    return false;
  }
}



async function getSetById(userId, selectedSet, setId){
  // console.log("userId: ", userId);
  // console.log("setId", setId);

  const params = {
    Bucket: BUCKET_NAME,
    Key: `flashcards/${userId}/${selectedSet}/${setId}.json`
  };

  try{
    const result = await s3Client.getObject(params).promise();

    const jsonData = JSON.parse(result.Body.toString('utf-8'));

    return jsonData;
  }
  catch(err){
    console.error("Failed to get flashcard set!", err);
    return false;
  }
}


module.exports = { saveFlashcardSetMetadata, saveFlashcardSetToS3, getAllFlashcardSets, getDetailedSet, getSetById };