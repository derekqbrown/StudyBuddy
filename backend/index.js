const express = require('express');
const app = express();
const userController = require("./controller/userController");
const geminiController = require("./controller/geminiController");
const flashcardsController = require("./controller/flashcardController");
const examsController = require("./controller/examsController");
const cors = require("cors");

const port = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', 'http://studybuddy-production.s3-website-us-west-2.amazonaws.com',
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('Welcome to StudyBuddy!');
});

app.use('/users', userController);
app.use('/chat', geminiController);
app.use('/flashcards', flashcardsController);
app.use('/exams', examsController);



// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;