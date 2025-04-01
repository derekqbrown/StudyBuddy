const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const AWS = require('aws-sdk'); 

const baseClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
});

const documentClient = DynamoDBDocumentClient.from(baseClient);


const s3 = new AWS.S3();

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

  await s3.putObject(params).promise();
}


async function getAllFlashcards(userId){
  const params = {
    Bucket: 'study-buddy-s3-bucket', 
    Key: `flashcards/${userId}.json`,
  };

  try{
  const result = await s3.getObject(params).promise();

  return result;
  }
  catch(err){
    console.error("Failed to retrieve flashcards!");
    return null;
  }

}


module.exports = { saveFlashcardSetMetadata, saveFlashcardSetToS3, getAllFlashcards };