const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authenticateToken = require("../util/jwt");
const { promptifyFlashCards } = require("../util/geminiPrompt");
const flashcardService = require('../service/flashcardService');


const ai = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);


router.post("/", authenticateToken, async (req, res) => {
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
        
        res.json({ reply: text });
      } catch (error) {
        console.error("Gemini error:", error);
        res.status(500).json({ error: "Failed to generate response from Gemini" });
      }
})


router.post("/save", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const flashcardSetName = req.body.name;
    const flashcards = req.body.flashcards;

    if (!flashcardSetName || !flashcards) {
      return res.status(400).json({ message: "Set name and flashcards are required" });
    }

    const flashcardSetId = await flashcardService.saveFlashcards(userId, flashcardSetName, flashcards);

    res.json({ flashcardSetId });
  } 
  catch (error) {
    console.error("Error saving flashcards:", error);
    res.status(500).json({ message: "Failed to save flashcards" });
  }
})


router.get("/all-flashcards", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    
    const result = await flashcardService.getAllFlashcardSets(userId);

    if(!result){
      res.status(400).json({ message: "Failed to get all flashcards"});
    }

    res.status(200).json(result);
})


router.get("/:setid", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const userSetId = req.params.setid;

  console.log("User set Id: ", userSetId);

  const result = await flashcardService.getSetById(userId, userSetId);

  if(!result){
    res.status(400).json({ message: "Failed to get all flashcards"});
  }

  res.status(200).json(result);
})



module.exports = router;