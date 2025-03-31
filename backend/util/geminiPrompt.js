
const promptifyFlashCards = (userInput) => {

    let prompt = `
Based on the following notes, generate flashcards in **valid JSON array format only**. 
Do not include any explanations, markdown, or additional text — just the JSON array.

Notes: "${userInput}"

Example format:
[
  {
    "question": "What is the smallest prime number?",
    "answer": "2. It is the only even prime number."
  },
  {
    "question": "Which planet in our solar system has the most moons?",
    "answer": "Saturn. As of late 2023, Saturn has the most confirmed moons."
  },
  {
    "question": "What is the chemical symbol for gold?",
    "answer": "Au, derived from the Latin word 'aurum'."
  }
]
`;

    return prompt;
}

// If/when we implement exams, we will need to create a similar 
// function to the one above, but include 3 wrong answers, 
// and a boolean "isCorrect" for each answer.
/* Below is an example for the exam/quiz format:
[
  {
    "question": "What is the capital of Australia?",
    "answers": [
      { "text": "Sydney", "isCorrect": false },
      { "text": "Melbourne", "isCorrect": false },
      { "text": "Canberra", "isCorrect": true },
      { "text": "Perth", "isCorrect": false }
    ]
  },
  {
    "question": "Which of these elements is a noble gas?",
    "answers": [
      { "text": "Oxygen", "isCorrect": false },
      { "text": "Nitrogen", "isCorrect": false },
      { "text": "Argon", "isCorrect": true },
      { "text": "Carbon", "isCorrect": false }
    ]
  },
  {
    "question": "What is the largest ocean on Earth?",
    "answers": [
      { "text": "Atlantic Ocean", "isCorrect": false },
      { "text": "Indian Ocean", "isCorrect": false },
      { "text": "Pacific Ocean", "isCorrect": true },
      { "text": "Southern Ocean", "isCorrect": false }
    ]
  }
]
*/

module.exports = promptifyFlashCards;