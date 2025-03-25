const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand, ScanCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const AWS = require("aws-sdk");
require("dotenv").config();

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
        const result = documentClient.send(command);
        if(result.Items.length > 0){
            return result.Items[0];
        }
        else{
            return null;
        }
    }  
    catch(error){
        console.error(err);
        return null;
    }
}


module.exports = { getUser };