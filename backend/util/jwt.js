const jwt = require("jsonwebtoken");
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
require("dotenv").config

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

async function authenticateToken(req, res, next){
    const authHeader = req.headers("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    console.log("Received Token: ", token);

    if(!token){
        return res.status(403).json({message: "Forbidden Access!"});
    }
    
    const user = await decodeJWT(token);
    if(!user){
        return res.status(403).json({message: "Invalid Token!"});
    }

    req.user = user;
    next();
}

async function decodeJWT(token){
    const secretKey = await getJwtSecret();
    try{
        return jwt.verify(token, secretKey);
    }
    catch(err){
        console.error(err);
        return null;
    }
}

module.exports = authenticateToken;