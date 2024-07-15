describe('Command: wpCli', () => {
  it('Should run cli command and receive the response', () => {
    cy.wpCli('wp cli version')
      .its('stdout')
      .should('match', /^WP-CLI \d+\.\d+/);
  });

  it('Should not fail with ignoreFailures=true', () => {
    const randomCommand =
      'command' + (Math.random() + 1).toString(16).substring(3);
    cy.wpCli(randomCommand, true).its('code').should('equal', 1);
  });

  it('Should run cli in eval mode', () => {
    const evalSting = (Math.random() + 1).toString(16).substring(2);
    cy.wpCliEval(`<?php echo 'Test Eval Command ${evalSting}';`)
      .its('stdout')
      .should('contain', evalSting);
  });
});
