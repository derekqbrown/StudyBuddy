describe('Profile Display', () => {
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

    it('Display Profile Content', () => {
        const fakeSignedUrl = 'https://fake-url.com/image.jpg';

        cy.intercept('GET', 'http://localhost:3000/users/profile-pic', {
            statusCode: 200,
            body: { url: fakeSignedUrl }
        }).as('getProfilePic');

        cy.visit('http://localhost:5173/profile');

        cy.wait('@getProfilePic');

        cy.get('img[alt="Profile"]')
            .should('exist')
            .and('be.visible')
            .and('have.attr', 'src', fakeSignedUrl);

        cy.get('h2.text-2xl.font-bold.text-white').should('exist').and('have.text', 'Profile');
        cy.get('p.text-white.text-center.rounded.text-2xl').should('exist').and('have.text', 'Username: test5');
        cy.contains('button', 'View Flashcard Sets')
            .should('exist')
            .and('be.visible')
            .click();
        cy.url().should('include', '/flashcardSets')
    });

})