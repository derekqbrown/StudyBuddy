const request = require('supertest');
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const flashcardService = require('../service/flashcardService');
const authenticateToken = require('../util/jwt');
const promptifyFlashCards = require('../util/geminiPrompt');
const geminiPrompt = require('../util/geminiPrompt')
// Mock dependencies
jest.mock('../util/geminiPrompt');
jest.mock('../service/flashcardService');
jest.mock('../util/jwt');




const app = express();
app.use(express.json());
app.use('/flashcards', require("../controller/flashcardController"));

describe('Flashcard Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /flashcards', () => {
    it('should generate flashcards content with valid prompt', async () => {
      const mockUser = { id: 'USER#123' };
      const mockPrompt = 'What is the capital of France?';
    
      authenticateToken.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });
    
      geminiPrompt.generateContent = jest.fn().mockResolvedValue(JSON.stringify([{ "question": "What is the capital of France?", "answer": "Paris" }]));

      const response = await request(app)
        .post('/flashcards')
        .send({ prompt: mockPrompt })
        .set('Authorization', 'Bearer valid-token');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('reply');
      const reply = JSON.parse(response.body.reply);
      expect(reply[0].answer).toBe('Paris');

    console.log(mockPrompt)    });

    it('should return 400 if no prompt is provided', async () => {
      const response = await request(app)
        .post('/flashcards')
        .send({})  // Missing prompt
        .set('Authorization', 'Bearer valid-token');

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Prompt is required.');
    });

    it('should return 500 if there is an error from Gemini API', async () => {    
      const mockUser = { id: 'USER#123' };
      const mockError = 'Gemini API error';
      
            authenticateToken.mockImplementation((req, res, next) => {
              req.user = mockUser;
              next();
            });
      
      geminiPrompt.generateContent = jest.fn().mockRejectedValueOnce(mockError);

      
      const response = await request(app)
        .post('/flashcards')
        .send({ prompt: 'What is the capital of France?' })
        .set('Authorization', 'Bearer valid-token');
    
      expect(response.statusCode).toBe(500);
    });    
  });

  // Test for /flashcards/save endpoint (save flashcards)
  describe('POST /flashcards/save', () => {
    it('should save flashcards successfully', async () => {
      const mockUser = { id: 'USER#123' };
      const mockFlashcardSetName = 'History Flashcards';
      const mockFlashcards = [{ question: 'Who was the first president of the USA?', answer: 'George Washington' }];
      const mockFlashcardSetId = 'set123';

      authenticateToken.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      flashcardService.saveFlashcards.mockResolvedValue(mockFlashcardSetId);

      const response = await request(app)
        .post('/flashcards/save')
        .send({ name: mockFlashcardSetName, flashcards: mockFlashcards })
        .set('Authorization', 'Bearer valid-token');

      expect(response.statusCode).toBe(200);
      expect(response.body.flashcardSetId).toBe(mockFlashcardSetId);
      expect(flashcardService.saveFlashcards).toHaveBeenCalledWith(mockUser.id, mockFlashcardSetName, mockFlashcards);
    });

    it('should return 400 if name or flashcards are missing', async () => {
      const response = await request(app)
        .post('/flashcards/save')
        .send({ name: 'History Flashcards' })  // Missing flashcards
        .set('Authorization', 'Bearer valid-token');

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Set name and flashcards are required');
    });

    it('should return 500 if there is an error saving flashcards', async () => {
      const mockUser = { id: 'USER#123' };
      const mockError = new Error('Database error');
      authenticateToken.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      flashcardService.saveFlashcards.mockRejectedValue(mockError);

      const response = await request(app)
        .post('/flashcards/save')
        .send({ name: 'History Flashcards', flashcards: [] })
        .set('Authorization', 'Bearer valid-token');

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Failed to save flashcards');
    });
  });

  // Test for /flashcards/all-flashcards endpoint (get all flashcards)
  describe('GET /flashcards/all-flashcards', () => {
    it('should return all flashcards for the user', async () => {
      const mockUser = { id: 'USER#123' };
      const mockFlashcardSets = [{ id: 'set1', name: 'History Flashcards' }];

      authenticateToken.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      flashcardService.getAllFlashcardSets.mockResolvedValue(mockFlashcardSets);

      const response = await request(app)
        .get('/flashcards/all-flashcards')
        .set('Authorization', 'Bearer valid-token');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockFlashcardSets);
    });

    it('should return 400 if no flashcards are found', async () => {
      const mockUser = { id: 'USER#123' };
      authenticateToken.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      flashcardService.getAllFlashcardSets.mockResolvedValue(null);

      const response = await request(app)
        .get('/flashcards/all-flashcards')
        .set('Authorization', 'Bearer valid-token');

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Failed to get all flashcards');
    });
  });

  // Test for /flashcards/:setid endpoint (get a specific flashcard set)
  describe('GET /flashcards/:setid', () => {
    it('should return a flashcard set by ID', async () => {
      const mockUser = { id: 'USER#123' };
      const mockSetId = 'set123';
      const mockFlashcardSet = { id: mockSetId, name: 'History Flashcards' };

      authenticateToken.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      flashcardService.getSetById.mockResolvedValue(mockFlashcardSet);

      const response = await request(app)
        .get(`/flashcards/${mockSetId}`)
        .set('Authorization', 'Bearer valid-token');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockFlashcardSet);
    });

    it('should return 400 if the flashcard set is not found', async () => {
      const mockUser = { id: 'USER#123' };
      const mockSetId = 'set123';

      authenticateToken.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      flashcardService.getSetById.mockResolvedValue(null);

      const response = await request(app)
        .get(`/flashcards/${mockSetId}`)
        .set('Authorization', 'Bearer valid-token');

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Failed to get all flashcards');
    });
  });
});
