describe('Command: login', () => {
  before(() => {
    cy.logout();
  });

  it('Login admin by default', () => {
    cy.login();
    cy.visit('/wp-admin');
    cy.get('h1').should('contain', 'Dashboard');
  });

  it('Switch users', () => {
    cy.login('user1', 'password1');
    cy.login('user2', 'password2');
    cy.login();
  });
});
