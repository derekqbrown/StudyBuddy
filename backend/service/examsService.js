const examDAO = require('../repository/examsDAO'); 
const { v4: uuidv4 } = require('uuid'); 
const logger = require('../util/logger');

async function saveExams(userId, examSetName, exam) {
  const setId = uuidv4();
  const examSetJson = JSON.stringify({ exam });

  logger.info(`Saving exam set '${examSetName}' for user ${userId}.`);

  await examDAO.saveExamSetToS3(userId, setId, examSetName, examSetJson);
  await examDAO.saveExamSetMetadata(userId, setId, examSetName);

  logger.info(`Exam set '${examSetName}' saved successfully for user ${userId}.`);
  return setId;
}

async function scoreExam(userId, setId, examSetName, userAnswers) {
  const examData = await examDAO.getExamSetFromS3(userId, setId, examSetName);
  const originalExam = examData.exam;

  let correctCount = 0;
  const totalQuestions = originalExam.length;

  for (let i = 0; i < totalQuestions; i++) {
    const originalQuestion = originalExam[i];
    const correctOption = originalQuestion.answers.find(ans => ans.isCorrect)?.text;
    const userAnswer = userAnswers[i];

    if (userAnswer === correctOption) {
      correctCount++;
    }
  }

  return {
    score: correctCount,
    total: totalQuestions,
    percentage: ((correctCount / totalQuestions) * 100).toFixed(2)
  };
}

async function takeExam(userId, examId, examSetName) {
  const fullExam = await examDAO.getExamSetFromS3(userId, examId, examSetName);

  // remove isCorrect for test-taking
  const maskedExam = fullExam.exam.map(q => ({
    question: q.question,
    answers: q.answers.map(a => ({ text: a.text }))
  }));

  return { exam: maskedExam };
}

async function assignExam(examSet, examId, teacherId, studentId) {
    const assignedExam = await examDAO.assignExam(examSet, examId, teacherId, studentId);


    if(!assignExam){
      return false;
    }
    
    return assignedExam;
}

async function getAllSets(userId){
    const result = await examDAO.getAllSets(userId);

    return result;
}

async function getExamSet(setName, userId){
    const examSet = await examDAO.getExamSet(setName, userId);

    return examSet;
}

module.exports = { saveExams, scoreExam, takeExam, assignExam, getAllSets, getExamSet };