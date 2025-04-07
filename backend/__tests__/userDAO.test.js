const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { getUser, createUser, updateUser } = require('../repository/userDAO');

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('UserDAO Tests', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  //test 1: getUser successfully retrieves user
  describe('getUser', () => {
    it('should return user when exists', async () => {
      const mockUser = { 
        user_id: 'USER#123', 
        username: 'testuser',
        sort_key: 'PROFILE'
      };

      ddbMock.on(QueryCommand).resolves({
        Items: [mockUser]
      });

      const result = await getUser('testuser');
      expect(result).toEqual(mockUser);
    });
  });

  // Test 2: createUser successfully creates user
  describe('createUser', () => {
    it('should create new user with valid parameters', async () => {
      ddbMock.on(PutCommand).resolves({});

      const result = await createUser('newuser', 'securepass');
      expect(result).toHaveProperty('username', 'newuser');

      const putCalls = ddbMock.commandCalls(PutCommand);
      expect(putCalls[0].args[0].input.Item).toMatchObject({
        sort_key: 'PROFILE',
        username: 'newuser',
        password: 'securepass'
      });
    });
  });

});