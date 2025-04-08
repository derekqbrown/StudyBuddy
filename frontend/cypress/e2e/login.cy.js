describe('Login', () => {
    beforeEach(() => {
      cy.visit('http://localhost:5173/login');
    });
  
    it('should show username and password fields', () => {
      cy.get('input#username').should('exist');
      cy.get('input#password').should('exist');
    });
  
    it('should show error for invalid credentials', () => {
      cy.intercept('POST', 'http://localhost:3000/users/login', {
        statusCode: 400,
        body: { message: 'Invalid username or password!' },
      }).as('failedRegister');
      cy.get('input#username').type('wronguser');
      cy.get('input#password').type('wrongpass');
      cy.get('button[type="submit"]').click();
      cy.get('p.text-red-500').should('contain', 'Request failed');
    });
  
    it('should login successfully with correct credentials', () => {
      cy.intercept('POST', 'http://localhost:3000/users/login', {
        statusCode: 200,
        body: { message: 'You have logged in!!', token:"FakeToken", user_id:"FakeUserId" },
      }).as('failedRegister');
      cy.get('input#username').type('test3');
      cy.get('input#password').type('password'); 
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:5173/');
      cy.window().then(win => {
        expect(win.localStorage.getItem('token')).to.exist;
      });
    });
  });
