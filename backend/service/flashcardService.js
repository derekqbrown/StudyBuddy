const flashcardDAO = require('../repository/flashcardDAO'); 
const { v4: uuidv4 } = require('uuid'); 

async function saveFlashcards(userId, flashcardSetName, flashcards) {
  const setId = uuidv4();
  const flashcardSetJson = JSON.stringify({ flashcards }); // Assuming flashcards is an array
  console.log("userId: ", userId);
  console.log("SetName: ", flashcardSetName);
  console.log("flashcards:  ", flashcards);

  await flashcardDAO.saveFlashcardSetToS3(userId, setId, flashcardSetJson);

  await flashcardDAO.saveFlashcardSetMetadata(userId, setId, flashcardSetName);

  return setId;
}

async function getAllFlashcards(userId){
  const allFlashcards = flashcardDAO.getAllFlashcards(userId);

  return allFlashcards;
}



module.exports = { saveFlashcards, getAllFlashcards };