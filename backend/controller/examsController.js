const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authenticateToken = require("../util/jwt");
const { promptifyExams } = require("../util/geminiPrompt");
const examsService = require('../service/examsService');
const logger = require("../util/logger");

const ai = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);


// creating the exam
router.post('/create-exam', authenticateToken, async (req, res) => {
    // logger.info("calling create exam");
    try{
        const userId = req.user.id;
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
        const userPrompt = req.body.prompt;

        if (!userPrompt) {
            logger.warn("Prompt is required for exam generation.");
            return res.status(400).json({ error: "Prompt is required." });
        }

        console.log(userPrompt);

        let newUserPrompt = promptifyExams(userPrompt);
        const result = await model.generateContent(newUserPrompt);
        const response = await result.response;
        const text = response.text();

        logger.info(`Examss generated for user: ${userId}`);
        res.json({ reply: text });
    }catch(err){
        logger.error("Gemini error:", err);
        res.status(500).json({ err: "Failed to generate exam from Gemini" });
    }
})

router.post('/save', authenticateToken, async (req, res) => {
    try{
        const userId = req.user.id;
        const examSetName = req.body.name;
        const exam = req.body.exam;

        const response = await examsService.saveExams(userId, examSetName, exam);

        if(!response){
            return res.status(400).json({ err: "Failed to receive response" });
        }

        res.status(200).json({Message: "Exam saved"});
    }catch(err){
        // console.error(err);
        res.status(500).json({ err: "Failed to save exam from Gemini" });
    }
})

router.post('/score', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { setId, examSetName, answers } = req.body;
  
      if (!setId || !examSetName || !answers) {
        return res.status(400).json({ error: "setId, examSetName, and answers are required." });
      }
  
      const result = await examsService.scoreExam(userId, setId, examSetName, answers);
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to score exam:", err);
      res.status(500).json({ error: "Failed to score exam." });
    }
});
  
router.post('/take/:examid', authenticateToken, async (req, res) => {
try {
    const userId = req.user.id;
    const { examid } = req.params;
    const { examSetName } = req.body;

    if (!examSetName) {
    return res.status(400).json({ error: "Exam set name is required." });
    }

    const exam = await examsService.takeExam(userId, examid, examSetName);

    if (!exam) {
        return res.status(404).json({ error: "Exam not found." });
    }

    res.status(200).json(exam);
} catch (err) {
    console.error("Failed to retrieve exam:", err);
    res.status(500).json({ error: "Failed to retrieve exam." });
}
});



// get all sets for a user
router.get('/all-sets', authenticateToken, async (req, res) => {
    try{
        const userId = req.user.id;

        const allSets = await examsService.getAllSets(userId);

        logger.info(`All Sets: ${allSets}`);

        if(!allSets){
            res.status(400).json({Message: "Failed to get sets!"});
        }

        res.status(200).json(allSets);

    }catch(err){
        console.log(err);
        return res.status(400).json({err});
    }
})


router.get('/:examset', authenticateToken, async (req, res) => {
    try{
        const setName = req.params.examset;
        const userId = req.user.id;

        const examSet = await examsService.getExamSet(setName, userId);

        if (!examSet) {
            return res.status(404).json({ error: "Exam not found." });
        }

        res.status(200).json(examSet);
    }catch(err){
        res.status(400).json({Message: "Failed to get exam sets", err});
    }
})


// get specific set for a user
router.post('/assign/:examset/:examid', authenticateToken, async (req, res) => {
    
    try{
        const examSet = req.params.examset;
        const examId = req.params.examid;
        const studentId = req.body.studentId;
        const teacherId = req.user.id;
        logger.info("student Id: ", studentId);

        const exam = await examsService.assignExam(examSet, examId, teacherId, studentId);

        console.log("assigned exam: ", exam)

        if(!exam){
            return res.status(404).json({Message: "Failed to assign exam!"});
        }

        return res.status(200).json(exam);
    }catch(err){
        console.log(err);
        return res.status(400).json({Message: "Failed to assign exam!"});
    }
})


module.exports = router;