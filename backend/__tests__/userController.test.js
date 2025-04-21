const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const userService = require('../service/userService');
const bcrypt = require('bcrypt');
const { log } = require('../util/logger');
const { getJwtSecret } = require('../util/secretKey');

// Mock dependencies
jest.mock('../service/userService');
jest.mock('bcrypt');
jest.mock('../util/secretKey');

const app = express();
app.use(express.json());
app.use('/users', require("../controller/userController"));

describe('User Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // login endpoint test
  describe('POST /users/login', () => {
    it('should return JWT token with valid credentials', async () => {
      const mockUser = {
        user_id: 'USER#123',
        username: 'testuser',
        password: 'hashedpass'
      };

      userService.getUser.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      getJwtSecret.mockResolvedValue('fake-secret-key');

      const response = await request(app)
        .post('/users/login')
        .send({ username: 'testuser', password: 'validpass' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(jwt.verify(response.body.token, 'fake-secret-key')).toBeTruthy();
    });
  });

  // Registration endpoint test
  describe('POST /users/register', () => {

    it('should create new user with unique username', async () => {
      userService.getUser.mockResolvedValue(null);
      

      const spyCreateUser = jest.spyOn(userService, 'createUser').mockImplementation((username, password) => {        
        
        return Promise.resolve({ user_id: 'USER#1', username: username });
      });      

      const mockRequest = {
        body: {}
      };
      mockRequest.body.password = 'ValidPass123!';
      const response = await request(app)
        .post('/users/register')
        .send({ username: 'newuser', ...mockRequest.body});
      console.log("createUser received parameters:", spyCreateUser.mock.calls)
      expect(response.statusCode).toBe(201);
    });

    it('should return 400 for existing username', async () => {
      userService.getUser.mockResolvedValue({ username: 'existinguser' });

      const response = await request(app)
      
        .post('/users/register')
        .send({ username: 'existinguser', password: 'anypass' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/already taken/i);
    });
  });

  // Logout endpoint
  describe('POST /users/logout', () => {
    it('should successfully logout with valid token', async () => {
      // Mock authentication middleware
      const mockUser = { user_id: 'USER#123', username: 'testuser' };
      const mockVerify = jest.spyOn(jwt, 'verify').mockImplementation(() => mockUser);

      const response = await request(app)
        .post('/users/logout')
        .set('Authorization', 'Bearer valid-token');

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toMatch(/logged out/i);
      mockVerify.mockRestore();
    });
  });
});