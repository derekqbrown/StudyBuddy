describe('Flashcards Feature', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'fake-token'); // mock authentication
    });
  
    it('generates flashcards from notes input', () => {
      cy.intercept('POST', 'http://localhost:3000/flashcards', {
        statusCode: 200,
        body: {
          reply: '```json\n' + JSON.stringify([
            { question: "What is React?", answer: "A JS library for building UI" },
            { question: "What is JSX?", answer: "A syntax extension for JavaScript" }
          ]) + '\n```'
        }
      }).as('generateFlashcards');
  
      cy.visit('http://localhost:5173/generateflashcards');
      cy.get('#prompt-area').type('Explain React and JSX');
      cy.get('#submit-prompt').click();
      cy.wait('@generateFlashcards');
  
      cy.get('.flashcard-block').should('have.length', 2);
      cy.contains('Q: What is React?').should('exist');
      cy.contains('A: A JS library for building UI').should('exist');
    });
  
  
    it('views flashcards and flips a card', () => {
      cy.intercept('GET', 'http://localhost:3000/flashcards/testSet/abc123', {
        statusCode: 200,
        body: {
          flashcards: [
            { question: "Capital of France?", answer: "Paris" },
            { question: "2 + 2?", answer: "4" }
          ]
        }
      }).as('loadFlashcards');
  
      cy.visit('http://localhost:5173/flashcards/testSet/abc123');
      cy.wait('@loadFlashcards');
  
      cy.contains('Q: Capital of France?').should('exist');
      cy.get('[style*="rotateY(0deg)"]').first().click();
      cy.get('[style*="rotateY(180deg)"]').should('exist');
    });
  });
  