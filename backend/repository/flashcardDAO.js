const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { s3, BUCKET_NAME, getSignedUrl, client } = require("../util/awsClient");

const AWS = require('aws-sdk'); 

const documentClient = DynamoDBDocumentClient.from(client);


const s3Client = new AWS.S3();

async function saveFlashcardSetMetadata(userId, setId, setName) {
  const command = new PutCommand({
    TableName: 'StudyData',
    Item: {
      user_id: `${userId}`,
      sort_key: `SET#${setId}`,
      setName,
    },
  });

  await documentClient.send(command);
}

async function saveFlashcardSetToS3(userId, setId, flashcardSetJson) {
  const params = {
    Bucket: 'study-buddy-s3-bucket', 
    Key: `flashcards/${userId}/${setId}.json`,
    Body: flashcardSetJson,
  };

  await s3Client.putObject(params).promise();
}


async function getAllFlashcardSets(userId) {
  const command = new QueryCommand ({
    TableName: 'StudyData',
    KeyConditionExpression: '#user_id = :userId AND begins_with(#sort_key, :prefix)',
    ExpressionAttributeNames: { 
      '#user_id': 'user_id',
      '#sort_key': 'sort_key'
    },
    ExpressionAttributeValues: { 
      ':userId': userId,
      ':prefix': 'SET#'
    }
  });

  try{
    const result = await documentClient.send(command);  
    console.log("flashcard sets: ", result.Items);
    return result.Items;
  }
  catch(err){
    console.error("Failed to retrieve fashcard sets!", err);
    return false;
  }
}



async function getSetById(userId, setId){
  // console.log("userId: ", userId);
  // console.log("setId", setId);

  const params = {
    Bucket: 'study-buddy-s3-bucket',
    Key: `flashcards/${userId}/${setId}.json`
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


module.exports = { saveFlashcardSetMetadata, saveFlashcardSetToS3, getAllFlashcardSets, getSetById };