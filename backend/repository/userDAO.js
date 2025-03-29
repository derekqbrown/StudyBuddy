const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand, ScanCommand, QueryCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const AWS = require("aws-sdk");
require("dotenv").config();
const { v4: uuidv4 } = require('uuid');

const { s3, BUCKET_NAME, getSignedUrl } = require("../util/s3Client");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});


const documentClient = DynamoDBDocumentClient.from(client);

async function getUser(username){
    const command = new QueryCommand({
        TableName: "StudyData",
        IndexName: "username-index",
        KeyConditionExpression: "username = :username",
        ExpressionAttributeValues: {
            ":username": username
        }
    });

    try{
        const result = await documentClient.send(command);
        // console.log("result: ", result)
        if(result.Items || result.Items.length > 0){
            return result.Items[0];
        }
        else{
            return null;
        }
    }  
    catch(err){
        console.error(err);
        return null;
    }
}


async function createUser(username, password) {

    const userId = `USER#${uuidv4()}`; 
    const sortKey = "PROFILE"; 
    const profilePic = "null";

    const command = new PutCommand({
        TableName: "StudyData",
        Item: {
            user_id: userId,
            sort_key: sortKey,
            username: username,
            password: password,
            profilePic: profilePic
        }
    });

    try {
        await documentClient.send(command);
        console.log(`User ${username} created successfully.`);
        return { username };
    } catch (err) {
        console.error("Error creating user: ", err);
        throw new Error("User creation failed");
    }
}


async function updateUser(userId, newUsername, newPassword) {
    if (!userId) {
      throw new Error("User ID is required for updating.");
    }
  
    const sortKey = "PROFILE"; 
  
    const updateExpression = [];
    const expressionAttributeValues = {};
  
    if (newUsername) {
      updateExpression.push("username = :username");
      expressionAttributeValues[":username"] = { S: newUsername };
    }
  
    if (newPassword) {
      updateExpression.push("password = :password");
      expressionAttributeValues[":password"] = { S: newPassword };
    }
  
    if (updateExpression.length === 0) {
      console.log("No fields to update provided.");
      return { message: "No fields to update provided." };
    }
  
    const params = {
      TableName: "StudyData",
      Key: marshall({
        user_id: userId,
        sort_key: sortKey,
      }),
      UpdateExpression: "SET " + updateExpression.join(", "),
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW", 
    };
  
    const command = new UpdateCommand(params);
  
    try {
      const data = await documentClient.send(command);
      console.log(`User with ID ${userId} updated successfully.`);
      return unmarshall(data.Attributes);
    } catch (err) {
      console.error("Error updating user: ", err);
      throw new Error("User update failed");
    }
}


async function deleteUser(userId) {
    const command = new DeleteCommand({
        TableName: "StudyData",
        Key: {
            user_id: userId,     
            sort_key: "PROFILE"
        }
    });

    try {
        await documentClient.send(command);
        console.log(`User with ID ${userId} deleted successfully.`);
        return { message: "User deleted successfully." };
    } catch (err) {
        console.error("Error deleting user: ", err);
        throw new Error("User deletion failed");
    }
}

async function updateUserProfilePicture(userId, fileKey) {
    const command = new UpdateCommand({
        TableName: "StudyData",
        Key: { user_id: userId, sort_key: "PROFILE" },
        UpdateExpression: "SET profilePic = :fileKey",
        ExpressionAttributeValues: { ":fileKey": fileKey }
    });

    await documentClient.send(command);
}

async function uploadProfilePictureToS3(userId, fileBuffer, fileType) {
    const fileKey = `profile-pictures/${userId}.jpg`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: fileType
    });

    try {
        await s3.send(command);
        return fileKey; //return the file key
    } catch (err) {
        console.error("Error uploading profile picture to S3: ", err);
        throw new Error("Profile picture upload to S3 failed");
    }
}


async function getProfilePictureFromS3(fileKey) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey
    });

    try {
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); //generate signed URL
        return signedUrl; // return the signed URL
    } catch (err) {
        console.error("Error retrieving profile picture from S3: ", err);
        throw new Error("Profile picture retrieval from S3 failed");
    }
}


module.exports = { getUser, createUser, updateUser, deleteUser, updateUserProfilePicture, getProfilePictureFromS3, 
    uploadProfilePictureToS3 }; 