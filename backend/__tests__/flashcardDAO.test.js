const { mockClient } = require('aws-sdk-client-mock');
const { S3Client, DynamoDBDocumentClient, PutCommand, QueryCommand,  } = require('@aws-sdk/lib-dynamodb');
const { saveFlashcardSetMetadata, saveFlashcardSetToS3, getAllFlashcardSets, getSetById } = require('../repository/flashcardDAO'); // Replace with the actual file path

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('Flashcard Set Functions', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('saveFlashcardSetMetadata', () => {
    it('should save flashcard set metadata successfully', async () => {
      ddbMock.on(PutCommand).resolves({});

      const userId = 'user123';
      const setId = 'set456';
      const setName = 'Math Set';

      await saveFlashcardSetMetadata(userId, setId, setName);

      const putCalls = ddbMock.commandCalls(PutCommand);
      expect(putCalls[0].args[0].input.Item).toMatchObject({
        user_id: userId,
        sort_key: `SET#${setId}`,
        setName: setName,
      });
    });
  });

  describe('saveFlashcardSetToS3', () => {
    it('should save flashcard set to S3 without throwing an error', async () => {
        const userId = 'user123';
        const setId = 'set456';
        const flashcardSetName = 'testFlashcardSet';
        const flashcardSetJson = JSON.stringify({ question: 'What is 2+2?', answer: '4' });
  
        await expect(
          saveFlashcardSetToS3(userId, setId, flashcardSetName, flashcardSetJson)
        ).resolves.not.toThrow(); 
  
      });
  });
  describe('getAllFlashcardSets', () => {
    beforeEach(() => {
      ddbMock.reset(); 
    });
  
    it('should retrieve all flashcard sets successfully', async () => {
      const userId = 'user123';
      const mockResult = {
        Items: [
          { user_id: 'user123', sort_key: 'SET#1', setName: 'Math Set' },
          { user_id: 'user123', sort_key: 'SET#2', setName: 'Science Set' },
        ],
      };
  
      ddbMock.on(QueryCommand).resolves(mockResult);
  
      const result = await getAllFlashcardSets(userId);
  
      expect(result).toEqual(mockResult.Items);
  
      const commandCalls = ddbMock.commandCalls(QueryCommand);
      expect(commandCalls[0].args[0].input.KeyConditionExpression).toBe('#user_id = :userId AND begins_with(#sort_key, :prefix)');
      expect(commandCalls[0].args[0].input.ExpressionAttributeValues).toEqual({
        ':userId': userId,
        ':prefix': 'SET#',
      });
    });
  
    it('should return false if there is an error retrieving flashcard sets', async () => {
      const userId = 'user123';
  
      ddbMock.on(QueryCommand).rejects(new Error('DynamoDB error'));
  
      const result = await getAllFlashcardSets(userId);
  
      expect(result).toBe(false);
  
      
    });
  });
  describe('getSetById', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should resolve without throwing an error when S3 retrieval is successful', async () => {
      const userId = 'user123';
      const selectedSet = 'math';
      const setId = 'set456';
      const expectedData = {
        cards: [
          { question: '2+2?', answer: '4' },
          { question: '3*3?', answer: '9' },
        ],
      };
  
      const mockS3Result = {
        Body: JSON.stringify(expectedData),
      };
  
      const mockS3 = {
        getObject: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue(mockS3Result) }),
        putObject: jest.fn().mockReturnValue({ promise: jest.fn() }),
      };
  
      jest.mock('aws-sdk/clients/s3', () => {
        return {
          S3: jest.fn(() => mockS3),
        };
      });
  
      jest.mock('aws-sdk', () => {
        return {
          S3: jest.fn(() => mockS3),
        };
      });
  
      await expect(getSetById(userId, selectedSet, setId)).resolves.not.toThrow();
    });
  
    it('should resolve without throwing an error when S3 retrieval fails (returns false)', async () => {
      const userId = 'user789';
      const selectedSet = 'science';
      const setId = 'set101';
  
      const mockS3 = {
        getObject: jest.fn().mockReturnValue({ promise: jest.fn().mockRejectedValue(new Error('S3 retrieval failed')) }),
        putObject: jest.fn().mockReturnValue({ promise: jest.fn() }),
      };
  
      jest.mock('aws-sdk/clients/s3', () => {
        return {
          S3: jest.fn(() => mockS3),
        };
      });
  
      jest.mock('aws-sdk', () => {
        return {
          S3: jest.fn(() => mockS3),
        };
      });
  
      await expect(getSetById(userId, selectedSet, setId)).resolves.not.toThrow();
    });
  });
});