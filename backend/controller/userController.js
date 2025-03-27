const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userService = require("../service/userService");
const authenticateToken = require("../util/jwt");
const { getJwtSecret } = require("../util/secretKey");
const validateLoginMiddleware = require("../middleware/loginMiddleware");
const bcrypt = require("bcrypt");


router.get("/", authenticateToken, async (req, res) => {
    const user = req.user;

    res.status(201).json(user);
})


// login endpoint
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


// logout endpoint
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


router.put("/update", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id; 
        const { username, password } = req.body;

        if (!userId) { // should only be thrown if there's a server error parsing token
            throw new Error("Unable to retrieve user_id");
        }
        if (!username && !password) {
            return res.status(400).json({ message: "A new username or password is required" });
        }

        const updatedUser = await userService.updateUser(userId, username || null, password || null); //if null, it won't be updated
        res.status(201).json({ message: "User updated successfully", user_id: updatedUser.username });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/delete", authenticateToken, async (req, res) => {
    try {
        const { username } = req.user;

        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        const existingUser = await userService.getUser(username); // Check if the user exists
        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const { id } = req.user; 

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        await userService.deleteUser(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;