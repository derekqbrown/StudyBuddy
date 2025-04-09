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
  

describe('View Flashcard Set', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
        cy.get('input#username').type('test5');
        cy.get('input#password').type('12345'); 
        cy.get('button[type="submit"]').click();
        cy.url().should('eq', 'http://localhost:5173/');
        cy.window().then(win => {
          expect(win.localStorage.getItem('token')).to.exist;
        });

      window.localStorage.setItem('token', 'fake-token');
  });


  it('Display Cards in a Set', () => {
    cy.visit('http://localhost:5173/profile');
    cy.contains('button', 'View Flashcard Sets').click();

    cy.contains('a', 'Biology 4').should('exist');
    cy.contains('a', 'Biology 5').should('exist').click();

    cy.contains('a', '0519c7ef-49e3-46f0-9400-44b2f47dc702').should('exist');
  })
})