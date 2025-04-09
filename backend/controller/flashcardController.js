const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authenticateToken = require("../util/jwt");
const promptifyFlashCards = require("../util/geminiPrompt");
const flashcardService = require('../service/flashcardService');
const validateSetMiddleware = require('../middleware/flashcardSetMiddleware');
const logger = require("../util/logger");

const ai = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

router.post("/", authenticateToken, async (req, res) => {
    try {
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
        const userId = req.user.id;
        const userPrompt = req.body.prompt;
        const flashcardSetName = req.body.name;

        if (!userPrompt) {
            logger.warn("Prompt is required for flashcard generation.");
            return res.status(400).json({ error: "Prompt is required." });
        }

        let newUserPrompt = await promptifyFlashCards(userPrompt);
        const result = await model.generateContent(newUserPrompt);
        const response = await result.response;
        const text = response.text();
        
        logger.info(`Flashcards generated for user: ${userId}`);
        res.json({ reply: text });
    } catch (error) {
        logger.error("Gemini error:", error);
        res.status(500).json({ error: "Failed to generate response from Gemini" });
    }
});

router.post("/save", authenticateToken, validateSetMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const flashcardSetName = req.body.name;
        const flashcards = req.body.flashcards;

        if (!flashcardSetName || !flashcards) {
            logger.warn("Set name or flashcards are missing.");
            return res.status(400).json({ message: "Set name and flashcards are required" });
        }

        const flashcardSetId = await flashcardService.saveFlashcards(userId, flashcardSetName, flashcards);
        logger.info(`Flashcard set saved for user: ${userId}, set name: ${flashcardSetName}`);
        
        res.json({ flashcardSetId });
    } catch (error) {
        logger.error("Error saving flashcards:", error);
        res.status(500).json({ message: "Failed to save flashcards" });
    }
});

router.get("/all-flashcards", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    
    const result = await flashcardService.getAllFlashcardSets(userId);

    if (!result) {
        logger.warn(`Failed to retrieve all flashcard sets for user: ${userId}`);
        return res.status(400).json({ message: "Failed to get all flashcards" });
    }

    logger.info(`Retrieved all flashcard sets for user: ${userId}`);
    res.status(200).json(result);
});

router.get("/flashcardSet/:setid", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const selectedSetId = req.params.setid;

    const result = await flashcardService.getDetailedSet(userId, selectedSetId);

    if (!result) {
        logger.warn(`Failed to open flashcard set with ID: ${selectedSetId} for user: ${userId}`);
        return res.status(400).json({ Message: "Failed to open set!" });
    }

    logger.info(`Flashcard set retrieved successfully for user: ${userId}, set ID: ${selectedSetId}`);
    return res.status(200).json(result);
});

router.get("/:flashcardSet/:setid", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const userSetId = req.params.setid;
    const selectedSet = req.params.flashcardSet;

    const result = await flashcardService.getSetById(userId, selectedSet, userSetId);

    if (!result) {
        logger.warn(`Failed to retrieve flashcards for user: ${userId}, set ID: ${userSetId}`);
        return res.status(400).json({ message: "Failed to get all flashcards" });
    }

    logger.info(`Flashcards retrieved successfully for user: ${userId}, set ID: ${userSetId}`);
    res.status(200).json(result);
});

module.exports = router;
