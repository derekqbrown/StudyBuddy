const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand, ScanCommand, QueryCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const AWS = require("aws-sdk");
require("dotenv").config();
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
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
    const userId = `USER#${uuidv4()}`; // generate a user ID
    const sortKey = `SORT#${uuidv4()}`; //generate a sort key

    const command = new PutCommand({
        TableName: "StudyData",
        Item: {
            user_id: userId,
            sort_key: sortKey,
            username: username,
            password: password
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




module.exports = { getUser, createUser };