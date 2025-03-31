const flashcardDAO = require('../repository/flashcardDAO'); 
const { v4: uuidv4 } = require('uuid'); 

async function saveFlashcards(userId, flashcards) {
  const setId = uuidv4();
  const flashcardSetJson = JSON.stringify({ flashcards }); // Assuming flashcards is an array

  await flashcardDAO.saveFlashcardSetToS3(userId, setId, flashcardSetJson);

  await flashcardDAO.saveFlashcardSetMetadata(userId, setId, 'Flashcard Set from AI');

  return setId;
}

module.exports = { saveFlashcards };