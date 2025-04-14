const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authenticateToken = require("../util/jwt");
const { promptifyExams } = require("../util/geminiPrompt");
const examsService = require('../service/examsService');
const logger = require("../util/logger");

const ai = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);


// taking the exam
router.post('/:examid', authenticateToken, async () => {

})


// creating and saving the exam
router.post('/create-exam', authenticateToken, async () => {

})

module.exports = router;