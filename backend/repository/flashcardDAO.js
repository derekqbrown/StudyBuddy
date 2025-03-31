const AWS = require('aws-sdk'); 

AWS.config.update({
  region: 'your-region', 
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
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

  await dynamoDB.put(params).promise();
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