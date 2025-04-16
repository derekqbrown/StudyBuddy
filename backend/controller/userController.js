const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userService = require("../service/userService");
const authenticateToken = require("../util/jwt");
const { getJwtSecret } = require("../util/secretKey");
const validateLoginMiddleware = require("../middleware/loginMiddleware");
const bcrypt = require("bcrypt");
const logger = require("../util/logger");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", authenticateToken, async (req, res) => {
    const user = req.user;
    logger.info(`User fetched: ${user.username}`);
    res.status(201).json(user);
});

// login endpoint
router.post("/login", validateLoginMiddleware, async (req, res) => {
    const { username, password } = req.body;
    const secretKey = await getJwtSecret();
    const data = await userService.getUser(username);

    if (!data) {
        logger.warn(`Login attempt failed for username: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        {
            id: data.user_id,
            username
        },
        secretKey,
        {
            expiresIn: "45m"
        }
    );
    logger.info(`User logged in: ${username}`);
    res.status(200).json({ message: "You have logged in!", token, user_id: data.user_id });
});

// logout endpoint
router.post("/logout", authenticateToken, (req, res) => {
    logger.info(`User logged out: ${req.user.username}`);
    res.status(200).json({ message: "You have logged out!" });
});

// registration endpoint
router.post("/register", async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const existingUser = await userService.getUser(username);
        if (existingUser) {
            logger.warn(`Registration attempt failed: username already taken - ${username}`);
            return res.status(400).json({ message: "Username already taken" });
        }

        const newUser = await userService.createUser(username, password, role);
        logger.info(`User registered successfully: ${newUser.username}`);
        res.status(201).json({ message: "User registered successfully", user_id: newUser.username });
    } catch (error) {
        logger.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/update", authenticateToken, async (req, res) => {
    try {
        const { id } = req.user;
        const { username, password } = req.body;

        if (!username && !password) {
            return res.status(400).json({ message: "No fields provided to update." });
        }

        const updatedUser = await userService.updateUser(id, username, password);
        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        logger.error("Update user error:", error);
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
            logger.warn(`Deletion attempt failed: User does not exist - ${username}`);
            return res.status(400).json({ message: "User does not exist" });
        }

        const { id } = req.user; 

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        await userService.deleteUser(id);
        logger.info(`User deleted successfully: ${username}`);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        logger.error("Delete error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/upload-profile-pic", authenticateToken, upload.single("profilePic"), async (req, res) => {
    try {
        if (!req.file) {
            logger.warn("No file uploaded");
            return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = req.user.id;
        const fileType = req.file.mimetype;

        const fileKey = await userService.uploadUserProfilePictureToS3(userId, req.file.buffer, fileType);
        await userService.updateUserProfilePicture(userId, fileKey);

        logger.info(`Profile picture uploaded successfully for user: ${userId}`);
        res.status(200).json({ message: "Profile picture uploaded successfully", fileKey });
    } catch (error) {
        logger.error("Upload error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/profile-pic", authenticateToken, async (req, res) => {
    try {
        const { username } = req.user;

        if (!username) {
            logger.warn("Username is required to fetch profile picture");
            return res.status(400).json({ message: "Username is required" });
        }

        const existingUser = await userService.getUser(username);
        if (!existingUser) {
            logger.warn(`User not found for profile picture: ${username}`);
            return res.status(404).json({ message: "User not found" });
        }

        if (!existingUser.profilePic) {
            logger.warn(`Profile picture not found for user: ${username}`);
            return res.status(404).json({ message: "Profile picture not found" });
        }

        const signedUrl = await userService.getProfilePicture(existingUser.profilePic);
        logger.info(`Profile picture retrieved successfully for user: ${username}`);
        res.status(200).json({ url: signedUrl });
    } catch (error) {
        logger.error("Get profile picture error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/create-set", authenticateToken, async (req, res) => {
    try {
        const userName = req.user.username;
        const newSet = req.body.newSet;
        
        const result = await userService.createSet(userName, newSet);

        if(!result){
            logger.warn(`Failed to create set for user: ${userName}`);
            return res.status(400).json({ Message: "Failed to create set" });
        }

        logger.info(`New set created successfully: ${newSet} for user: ${userName}`);
        res.status(200).json({ Message: "New Set Created!", newSet });
    } catch (err) {
        logger.error("Could not create set:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
