const request = require('supertest');
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const examsService = require('../service/examsService');
const authenticateToken = require('../util/jwt');
const { promptifyExams } = require('../util/geminiPrompt');

// Mock dependencies
jest.mock('@google/generative-ai');
jest.mock('../service/examsService.js');
jest.mock('../util/jwt');
jest.mock('../util/geminiPrompt');

const mockResponse = { text: 'Paris' };
const mockGenerateContent = jest.fn().mockResolvedValue({
  response: {
    text: jest.fn().mockReturnValue(mockResponse.text),
  },
});

jest.mock('../util/geminiPrompt', () => ({
    promptifyExams: jest.fn(),
}));

const mockModel = { generateContent: mockGenerateContent };

GoogleGenerativeAI.mockImplementation(() => ({
  getGenerativeModel: jest.fn().mockReturnValue(mockModel),
}));

const app = express();
app.use(express.json());
app.use('/exams', require("../controller/examsController"));


describe('Exam Controller Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe('POST /exams/create-exam', () => {
      it('should generate exam content with valid prompt', async () => {
        const mockUser = { id: 'USER#123' };
        // const mockPrompt = 'Fun facts about space';  
        const mockFormattedPrompt = 'fun facts about space';
  
        authenticateToken.mockImplementation((req, res, next) => {
          req.user = mockUser;
          next();
        });
  
        // Mock the promptifyExam utility function
        promptifyExams.mockReturnValue(mockFormattedPrompt);
  
        // Perform the request
        const response = await request(app)
          .post('/exams/create-exam')
          .send({ prompt: 'Fun facts about space' })
          .set('Authorization', 'Bearer valid-token');
  
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('reply');
        expect(mockGenerateContent).toHaveBeenCalledWith(mockFormattedPrompt);
        // expect(mockGenerateContent).toHaveBeenCalledWith(mockPrompt);
      });
  
      it('should return 400 if no prompt is provided', async () => {
        const response = await request(app)
          .post('/exams/create-exam')
          .send({})  // Missing prompt
          .set('Authorization', 'Bearer valid-token');
  
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Prompt is required.');
      });
    });

    it('should return 400 if saveExams fails', async () => {
        const mockUser = { id: 'USER#123' };
      
        authenticateToken.mockImplementation((req, res, next) => {
          req.user = mockUser;
          next();
        });
      
        examsService.saveExams.mockResolvedValue(false);
      
        const response = await request(app)
          .post('/exams/save')
          .send({ name: 'Set A', exam: [] })
          .set('Authorization', 'Bearer valid-token');
      
        expect(response.statusCode).toBe(400);
        expect(response.body.err).toBe("Failed to receive response");
      });
      
      it('should return 200 and confirmation message when exam is saved successfully', async () => {
        const mockUser = { id: 'USER#123' };
        const examSetName = 'Biology Test';
        const examData = [
          {
            question: "What is the powerhouse of the cell?",
            correctAnswer: "Mitochondria",
            answers: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"]
          }
        ];
      
        // Mock JWT middleware
        authenticateToken.mockImplementation((req, res, next) => {
          req.user = mockUser;
          next();
        });
      
        // Mock examService saveExams response
        examsService.saveExams.mockResolvedValue(true);
      
        const response = await request(app)
          .post('/exams/save')
          .send({
            name: examSetName,
            exam: examData
          })
          .set('Authorization', 'Bearer valid-token');
      
        expect(response.statusCode).toBe(200);
        expect(response.body.Message).toBe("Exam saved");
      
        expect(examsService.saveExams).toHaveBeenCalledWith(mockUser.id, examSetName, examData);
      });
      
})