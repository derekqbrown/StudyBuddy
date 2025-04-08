describe('ChatPage Feature', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'fake-token'); 
      cy.visit('http://localhost:5173/chat');
    });
  
    it('should display the question input area and submit button', () => {
      cy.get('#question-heading').should('contain', 'Ask a Question');
      cy.get('#prompt-area').should('exist').should('have.attr', 'placeholder', 'Type your question here...');
      cy.get('#submit-prompt').should('exist').should('contain', 'Submit');
    });
  
    it('should send a prompt and display a reply', () => {
      const question = 'What is the capital of Spain?';
      const mockReply = 'Madrid.';
  
      cy.intercept('POST', 'http://localhost:3000/chat', {
        statusCode: 200,
        body: { reply: mockReply },
      }).as('chatRequest');
  
      cy.get('#prompt-area').type(question);
      cy.get('#submit-prompt').click();
      cy.wait('@chatRequest');
  
      cy.get('#reply-container').should('exist');
      cy.get('#reply-block').should('contain', 'StudyBuddy Says:');
      cy.get('#reply-container').contains(mockReply).should('exist');
    });
  
    it('should handle API errors and display an error message', () => {
      const question = 'Tell me a joke';
      const errorMessage = 'Failed to fetch reply from the server.';
  
      cy.intercept('POST', 'http://localhost:3000/chat', {
        statusCode: 500,
        body: { message: errorMessage },
      }).as('chatRequestFailed');
  
      cy.get('#prompt-area').type(question);
      cy.get('#submit-prompt').click();
      cy.wait('@chatRequestFailed');
  
      cy.get('.text-red-500').should('contain', 'Request failed with status code 500');
      cy.get('#reply-container').should('not.exist');
    });
  
    it('should clear the reply after a new prompt is submitted', () => {
      const firstQuestion = 'First question';
      const firstReply = 'First answer.';
      const secondQuestion = 'Second question';
      const secondReply = 'Second answer.';
  
      cy.intercept('POST', 'http://localhost:3000/chat', {
        statusCode: 200,
        body: { reply: firstReply },
      }).as('firstChatRequest');
  
      cy.get('#prompt-area').type(firstQuestion);
      cy.get('#submit-prompt').click();
      cy.wait('@firstChatRequest');
      cy.get('#reply-container').should('contain', firstReply);
  
      cy.intercept('POST', 'http://localhost:3000/chat', {
        statusCode: 200,
        body: { reply: secondReply },
      }).as('secondChatRequest');
  
      cy.get('#prompt-area').clear().type(secondQuestion);
      cy.get('#submit-prompt').click();
      cy.wait('@secondChatRequest');
      cy.get('#reply-container').should('contain', secondReply);
      cy.get('#reply-container').should('not.contain', firstReply);
    });
  
    it('should render markdown in the reply', () => {
      const question = 'Format this as markdown';
      const markdownReply = '# Heading 1\n\n* Item 1\n* Item 2\n\n**Bold text**';
  
      cy.intercept('POST', 'http://localhost:3000/chat', {
        statusCode: 200,
        body: { reply: markdownReply },
      }).as('markdownRequest');
  
      cy.get('#prompt-area').type(question);
      cy.get('#submit-prompt').click();
      cy.wait('@markdownRequest');
  
      cy.get('#reply-container').find('h1').should('contain', 'Heading 1');
      cy.get('#reply-container').find('li').should('have.length', 2);
      cy.get('#reply-container').find('strong').should('contain', 'Bold text');
    });
  
    it('should display an error message if the prompt is empty (programmatic submit)', () => {
        cy.get('form').submit(); // Directly trigger the form's submit event to bypass 'required' attribute
        cy.get('.text-red-500').should('be.visible').should('contain', 'Prompt is required');
        cy.get('#reply-container').should('not.exist');
      });
  });