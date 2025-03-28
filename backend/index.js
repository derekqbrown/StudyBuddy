const express = require('express');
const app = express();
const userController = require("./controller/userController");
const geminiController = require("./controller/geminiController");
const cors = require("cors");

const port = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('Welcome to StudyBuddy!');
});

app.use('/users', userController);
app.use('/chat', geminiController);



// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;