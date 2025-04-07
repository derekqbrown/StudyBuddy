const flashcardDAO = require('../repository/flashcardDAO'); 
const { v4: uuidv4 } = require('uuid'); 

async function saveFlashcards(userId, flashcardSetName, flashcards) {
  const setId = uuidv4();
  const flashcardSetJson = JSON.stringify({ flashcards }); // Assuming flashcards is an array
  console.log("userId: ", userId);
  console.log("SetName: ", flashcardSetName);
  console.log("flashcards:  ", flashcards);

  await flashcardDAO.saveFlashcardSetToS3(userId, setId, flashcardSetName, flashcardSetJson);

  await flashcardDAO.saveFlashcardSetMetadata(userId, setId, flashcardSetName);

  return setId;
}

async function getAllFlashcardSets(userId){
  const allFlashcards = await flashcardDAO.getAllFlashcardSets(userId);

  if(!allFlashcards){
    return false;
  }

  return allFlashcards;
}

async function getDetailedSet(userId, setId){
  const detailedSet = await flashcardDAO.getDetailedSet(userId, setId);

  if(!detailedSet){
    return false;
  }

  return detailedSet
}

async function getSetById(userId, selectedSet, setId){
  const flashcardSet = await flashcardDAO.getSetById(userId, selectedSet, setId);

  if(!flashcardSet){
    return false;
  }

  return flashcardSet;
}


module.exports = { saveFlashcards, getAllFlashcardSets, getDetailedSet, getSetById };