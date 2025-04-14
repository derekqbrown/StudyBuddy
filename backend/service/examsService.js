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


module.exports = { saveExams };