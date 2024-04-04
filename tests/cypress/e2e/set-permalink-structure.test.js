describe('Command: setPermalinkStructure', () => {
  beforeEach(() => {
    cy.login();
  });

  const structures = [
    { name: 'Plain', value: '' },
    { name: 'Day and name', value: '/%year%/%monthnum%/%day%/%postname%/' },
    { name: 'Month and name', value: '/%year%/%monthnum%/%postname%/' },
    { name: 'Numeric', value: '/archives/%post_id%' },
    { name: 'Post name', value: '/%postname%/' },
  ];

  structures.forEach(structure => {
    it(`Should be able to set predefined ${structure.name} permalinks`, () => {
      cy.setPermalinkStructure(structure.value);
      cy.get('.notice-success, .notice.updated').should(
        'contain',
        'Permalink structure updated.'
      );
      cy.get('.form-table.permalink-structure :checked').should(
        'have.value',
        structure.value
      );
    });
  });

  it('Should be able to set custom permalinks', () => {
    const structure = '/custom/%second%/';
    cy.setPermalinkStructure(structure);
    cy.get('.notice-success, .notice.updated').should(
      'contain',
      'Permalink structure updated.'
    );
    cy.get('.form-table.permalink-structure :checked').should(
      'have.value',
      'custom'
    );
    cy.get('#permalink_structure').should('have.value', structure);
  });

  it('Should receive error if no tag added', () => {
    cy.setPermalinkStructure('no-tag');
    cy.get('.notice-error, .notice.error').should(
      'contain',
      'A structure tag is required when using custom permalinks.'
    );
  });

  after(() => {
    // Restore default permalink structure.
    cy.setPermalinkStructure('/%postname%/');
  });
});
