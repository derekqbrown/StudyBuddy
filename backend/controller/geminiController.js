const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authenticateToken = require("../util/jwt");
const { getGeminiKey } = require("../util/secretKey");
const logger = require("../util/logger");
require('dotenv').config();


router.post("/", authenticateToken, async (req, res) => {
    try {
        const geminiAPIKey = await getGeminiKey(); //process.env.GOOGLE_GEMINI_API_KEY;
        const ai = new GoogleGenerativeAI(geminiAPIKey);
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

        const userPrompt = req.body.prompt;
        if (!userPrompt) {
            logger.warn("Prompt is required for flashcard generation.");
            return res.status(400).json({ error: "Prompt is required." });
        }

        logger.info(`Generating flashcards for prompt: "${userPrompt}"`);
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text();
        
        logger.info("Flashcards generated successfully.");
        res.json({ reply: text });
    } catch (error) {
        logger.error("Gemini error:", error);
        res.status(500).json({ error: "Failed to generate response from Gemini" });
    }
});

module.exports = router;
