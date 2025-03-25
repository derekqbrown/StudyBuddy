const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
require("dotenv").config();

const ssmClient = new SSMClient({ region: process.env.AWS_REGION });

let cachedKey = null;
async function getJwtSecret() {
    if (cachedKey) {
        return cachedKey;
    }

    const command = new GetParameterCommand({
        Name: "jwt-secret-key",
        WithDecryption: true,
    });

    try {
        const response = await ssmClient.send(command);
        cachedKey = response.Parameter.Value;
        return cachedKey;
    } 
    catch (error) {
        console.error(error);
    }
}

module.exports = { getJwtSecret };