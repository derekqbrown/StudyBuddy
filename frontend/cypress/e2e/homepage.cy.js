// cypress/e2e/homepage.cy.js

describe('Homepage', () => {
  it('should show login and register buttons if not logged in', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Login').should('exist');
    cy.contains('Register').should('exist');
  });

  it('should navigate to login page when login button is clicked', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });

  it('should navigate to register page when register button is clicked', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Register').click();
    cy.url().should('include', '/register');
  });

  it('should show logged-in buttons when a token is present', () => {
    window.localStorage.setItem('token', 'fake-jwt-token');
    cy.visit('http://localhost:5173');
    cy.contains('Profile').should('exist');
    cy.contains('Chat').should('exist');
    cy.contains('Flashcard').should('exist');
    cy.contains('Logout').should('exist');
  });

  it('should logout and return to homepage state', () => {
    window.localStorage.setItem('token', 'fake-jwt-token');
    cy.visit('http://localhost:5173');
    cy.contains('Logout').click();
    cy.url().should('include', '/');
    cy.contains('Login').should('exist');
    cy.contains('Register').should('exist');
  });
});
