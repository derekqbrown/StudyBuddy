const request = require('supertest');
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const flashcardService = require('../service/flashcardService');
const authenticateToken = require('../util/jwt');
const promptifyFlashCards = require('../util/geminiPrompt');

// Mock dependencies
jest.mock('@google/generative-ai');
jest.mock('../service/flashcardService');
jest.mock('../util/jwt');
jest.mock('../util/geminiPrompt');

const mockUser = { id: 'USER#123' };
const mockPrompt = 'What is the capital of France?';

authenticateToken.mockImplementation((req, res, next) => {
  req.user = mockUser;
  next();
});

promptifyFlashCards.mockResolvedValue(mockPrompt);

const mockGenerateContent = jest.fn().mockRejectedValue(new Error('Gemini API error'));
const mockModel = { generateContent: mockGenerateContent };

GoogleGenerativeAI.mockImplementation(() => ({
  getGenerativeModel: jest.fn().mockReturnValue(mockModel),
}));

const app = express();
app.use(express.json());
app.use('/flashcards', require("../controller/flashcardController"));

describe('Flashcard Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /flashcards', () => {
   
    it('should return 500 if there is an error from Gemini API', async () => {
      
      const response = await request(app)
        .post('/flashcards')
        .send({ prompt: 'What is the capital of France?' })
        .set('Authorization', 'Bearer valid-token');

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe('Failed to generate response from Gemini');
      expect(mockGenerateContent).toHaveBeenCalledWith(mockPrompt);
    });
  });
  // ... more test cases for other functions...
});