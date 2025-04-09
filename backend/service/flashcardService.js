const flashcardDAO = require('../repository/flashcardDAO'); 
const { v4: uuidv4 } = require('uuid'); 
const logger = require('../util/logger');

async function saveFlashcards(userId, flashcardSetName, flashcards) {
  const setId = uuidv4();
  const flashcardSetJson = JSON.stringify({ flashcards });

  logger.info(`Saving flashcard set '${flashcardSetName}' for user ${userId}.`);

  await flashcardDAO.saveFlashcardSetToS3(userId, setId, flashcardSetName, flashcardSetJson);
  await flashcardDAO.saveFlashcardSetMetadata(userId, setId, flashcardSetName);

  logger.info(`Flashcard set '${flashcardSetName}' saved successfully for user ${userId}.`);
  return setId;
}

async function getAllFlashcardSets(userId) {
  const allFlashcards = await flashcardDAO.getAllFlashcardSets(userId);

  if (!allFlashcards) {
    logger.warn(`No flashcard sets found for user ${userId}.`);
    return false;
  }

  return allFlashcards;
}

async function getDetailedSet(userId, setId) {
  const detailedSet = await flashcardDAO.getDetailedSet(userId, setId);

  if (!detailedSet) {
    logger.warn(`Detailed set not found for user ${userId} with setId ${setId}.`);
    return false;
  }

  return detailedSet;
}

async function getSetById(userId, selectedSet, setId) {
  const flashcardSet = await flashcardDAO.getSetById(userId, selectedSet, setId);

  if (!flashcardSet) {
    logger.warn(`Flashcard set not found: user ${userId}, selectedSet ${selectedSet}, setId ${setId}.`);
    return false;
  }

  return flashcardSet;
}

module.exports = { saveFlashcards, getAllFlashcardSets, getDetailedSet, getSetById };
