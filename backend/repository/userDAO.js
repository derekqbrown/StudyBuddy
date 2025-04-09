const { DynamoDBDocumentClient, UpdateCommand, GetCommand, ScanCommand, QueryCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();
const { v4: uuidv4 } = require('uuid');
const { s3, BUCKET_NAME, getSignedUrl, client, TABLE_NAME } = require("../util/awsClient");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

//Import logger
const logger = require("../util/logger");

const documentClient = DynamoDBDocumentClient.from(client);

async function getUser(username) {
    const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "username-index",
        KeyConditionExpression: "username = :username",
        ExpressionAttributeValues: {
            ":username": username
        }
    });

    try {
        const result = await documentClient.send(command);
        if (result.Items || result.Items.length > 0) {
            return result.Items[0];
        } else {
            return null;
        }
    } catch (err) {
        logger.error("Error getting user:", err);
        return null;
    }
}

async function createUser(username, password) {
    const userId = `USER#${uuidv4()}`;
    const sortKey = "PROFILE";
    const profilePic = "null";

    const command = new PutCommand({
        TableName: TABLE_NAME,
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
        logger.info(`User ${username} created successfully.`);
        return { username };
    } catch (err) {
        logger.error("Error creating user:", err);
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
        logger.warn("No fields to update provided.");
        return { message: "No fields to update provided." };
    }

    const params = {
        TableName: TABLE_NAME,
        Key: marshall({ user_id: userId, sort_key: sortKey }),
        UpdateExpression: "SET " + updateExpression.join(", "),
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
    };

    const command = new UpdateCommand(params);

    try {
        const data = await documentClient.send(command);
        logger.info(`User with ID ${userId} updated successfully.`);
        return unmarshall(data.Attributes);
    } catch (err) {
        logger.error("Error updating user:", err);
        throw new Error("User update failed");
    }
}

async function deleteUser(userId) {
    const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
            user_id: userId,
            sort_key: "PROFILE"
        }
    });

    try {
        await documentClient.send(command);
        logger.info(`User with ID ${userId} deleted successfully.`);
        return { message: "User deleted successfully." };
    } catch (err) {
        logger.error("Error deleting user:", err);
        throw new Error("User deletion failed");
    }
}

async function updateUserProfilePicture(userId, fileKey) {
    const command = new UpdateCommand({
        TableName: TABLE_NAME,
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
        return fileKey;
    } catch (err) {
        logger.error("Error uploading profile picture to S3:", err);
        throw new Error("Profile picture upload to S3 failed");
    }
}

async function getProfilePictureFromS3(fileKey) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey
    });

    try {
        const signedUrl = await getSignedUrl(s3, command);
        return signedUrl;
    } catch (err) {
        logger.error("Error retrieving profile picture from S3:", err);
        throw new Error("Profile picture retrieval from S3 failed");
    }
}

async function createSet(userName, newSet) {
    const user = await getUser(userName);
    const userId = user.user_id;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `flashcards/${userId}/${newSet}/`,
        Body: ""
    });

    try {
        const result = await s3.send(command);
        return result;
    } catch (err) {
        logger.error("Failed to create a new set:", err);
        return false;
    }
}

module.exports = {
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserProfilePicture,
    getProfilePictureFromS3,
    uploadProfilePictureToS3,
    createSet
};
