const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userService = require("../service/userService");
const authenticateToken = require("../util/jwt");
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

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

const secretKey = cachedKey;

router.post("/login", validateLoginMiddleware, async(req, res) => {
    const { username, password } = req.body;

    const data = await userService.getUser(username);

    const token = jwt.sign(
        {
            id: data.user_id,
            username
        },
            secretKey,
        {
            expiresIn: "15m"
        }
    );
    res.status(200).json({message: "You have logged in!", token, user_id: data.user_id});
})

router.post("/logout", authenticateToken, (req, res) => {
    console.log("logging out");

    res.status(200).json({message: "You have logged out!"});
})


module.exports = router;