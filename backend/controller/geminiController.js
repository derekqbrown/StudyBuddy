const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authenticateToken = require("../util/jwt");
const { promptifyFlashCards } = require("../util/geminiPrompt");
const flashcardService = require('../service/flashcardService');
require('dotenv').config();

const geminiAPIKey = process.env.GOOGLE_GEMINI_API_KEY;

const ai = new GoogleGenerativeAI(geminiAPIKey);

router.post("/", authenticateToken, async (req, res) => {
    try {
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

        const userPrompt = req.body.prompt;
        if (!userPrompt) {
        return res.status(400).json({ error: "Prompt is required." });
        }
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text();
    
        res.json({ reply: text });
      } catch (error) {
        console.error("Gemini error:", error);
        res.status(500).json({ error: "Failed to generate response from Gemini" });
      }
})

router.post("/flashcards", authenticateToken, async (req, res) => {
  try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

      const userId = req.user.id;
      const userPrompt = req.body.prompt;
      const flashcardSetName = req.body.name;
      if (!userPrompt) {
      return res.status(400).json({ error: "Prompt is required." });
      }

      let newUserPrompt = promptifyFlashCards(userPrompt);
      const result = await model.generateContent(newUserPrompt);
      const response = await result.response;
      const text = response.text();

      const flashcardSetId = await flashcardService.saveFlashcards(userId, flashcardSetName, response);
      
      res.json({ reply: text, flashcardSetId:flashcardSetId});
    } catch (error) {
      console.error("Gemini error:", error);
      res.status(500).json({ error: "Failed to generate response from Gemini" });
    }
})

module.exports = router;