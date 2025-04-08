describe('Register', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/register'); 
  });

  it('should display the registration form with username and password fields', () => {
    cy.get('h2').should('contain', 'Register');
    cy.get('label[for="username"]').should('contain', 'Username:');
    cy.get('input#username').should('exist');
    cy.get('label[for="password"]').should('contain', 'Password:');
    cy.get('input#password').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Register');
  });

  it('should display an error message for invalid registration', () => {
    cy.intercept('POST', 'http://localhost:3000/users/register', {
      statusCode: 400, 
      body: { message: 'Invalid username or password!' },
    }).as('registerRequest');

    cy.get('input#username').type('existinguser');
    cy.get('input#password').type('weakpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest'); 
    cy.get('p.text-red-500').should('contain', 'Invalid username or password!');
    cy.url().should('eq', 'http://localhost:5173/register'); 
  });

  it('should successfully register a new user and navigate to the homepage', () => {
    cy.intercept('POST', 'http://localhost:3000/users/register', {
      statusCode: 201, 
      body: { message: 'User registered successfully' }, 
    }).as('registerRequest');

    const newUsername = `testuser_${Date.now()}`;
    const newPassword = 'securepassword';

    cy.get('input#username').type(newUsername);
    cy.get('input#password').type(newPassword);
    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest'); 
    cy.url().should('eq', 'http://localhost:5173/'); 
  });

  it('should handle empty username and password fields', () => {
    cy.get('button[type="submit"]').click();
    cy.get('input#username').should('have.value', '');
    cy.get('input#password').should('have.value', '');
  });

  it('should clear the error message when the form is submitted again', () => {
    cy.intercept('POST', 'http://localhost:3000/users/register', {
      statusCode: 400,
      body: { message: 'Invalid username or password!' },
    }).as('failedRegister');
    cy.get('input#username').type('invalid');
    cy.get('input#password').type('invalid');
    cy.get('button[type="submit"]').click();
    cy.wait('@failedRegister');
    cy.get('p.text-red-500').should('be.visible');

    cy.intercept('POST', 'http://localhost:3000/users/register', {
      statusCode: 201,
      body: { message: 'User registered successfully' },
    }).as('successfulRegister');
    cy.get('input#username').clear().type('newuser');
    cy.get('input#password').clear().type('newpass');
    cy.get('button[type="submit"]').click();
    cy.wait('@successfulRegister');
    cy.get('p.text-red-500').should('not.exist'); 
    cy.url().should('eq', 'http://localhost:5173/');
  });
});