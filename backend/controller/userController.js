const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userService = require("../service/userService");
const authenticateToken = require("../util/jwt");
const { getJwtSecret } = require("../util/secretKey");
const validateLoginMiddleware = require("../middleware/loginMiddleware");
const bcrypt = require("bcrypt");

router.post("/login", validateLoginMiddleware, async (req, res) => {
    const { username, password } = req.body;
    // console.log(username, password);
    secretKey = await getJwtSecret();

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

//registration endpoint
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await userService.getUser(username);
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const newUser = await userService.createUser(username, password);
        res.status(201).json({ message: "User registered successfully", user_id: newUser.username });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;