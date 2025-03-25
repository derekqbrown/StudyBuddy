const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userService = require("../service/userService");
const authenticateToken = require("../util/jwt");

const secretKey = process.env.MY_SECRET_KEY;

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