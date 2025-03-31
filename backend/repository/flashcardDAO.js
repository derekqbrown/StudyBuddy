const AWS = require('aws-sdk'); 

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});

const s3 = new AWS.S3();

async function saveFlashcardSetMetadata(userId, setId, setName) {
  const params = {
    TableName: 'StudyData', 
    Item: {
      PK: `${userId}`,
      SK: `SET#${setId}`,
      setName,
    },
  };

  await client.put(params).promise();
}

async function saveFlashcardSetToS3(userId, setId, flashcardSetJson) {
  const params = {
    Bucket: 'study-buddy-s3-bucket', 
    Key: `${userId}/${setId}.json`,
    Body: flashcardSetJson,
  };

  await s3.putObject(params).promise();
}

module.exports = { saveFlashcardSetMetadata, saveFlashcardSetToS3 };