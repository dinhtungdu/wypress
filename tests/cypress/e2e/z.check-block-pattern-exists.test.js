// This file is prepended with a `z.` as z.check-block-pattern-exists.test.js because for some
// reason, the order of the tests affect and fail tests in `create-post.test.js`.
// More investigation is needed to understand why this happens.

const { randomName } = require('../support/functions');
import { compare } from 'compare-versions';

describe('Command: checkBlockPatternExists', () => {
  if (compare(Cypress.env('WORDPRESS_CORE').toString(), '5.5', '>=')) {
    before(() => {
      cy.login();
      cy.deactivatePlugin('classic-editor');
    });

    beforeEach(() => {
      cy.login();
      cy.visit('/wp-admin/post-new.php');
      cy.get('.edit-post-header').should('exist');
      cy.closeWelcomeGuide();
    });

    const testPatterns = [
      { title: randomName(), cat: 'text', expected: false },
      { title: 'Quote', cat: randomName(), expected: false },
    ];

    testPatterns.forEach(testCase => {
      const shouldIt = testCase.expected ? 'should' : 'should not';
      it(`Pattern "${testCase.title}" ${shouldIt} exist in category "${testCase.cat}"`, () => {
        // Wait for patterns to load on the post edit page.

        const args = {
          title: testCase.title,
        };

        if (compare(Cypress.env('WORDPRESS_CORE').toString(), '5.7', '>=')) {
          args.categoryValue = testCase.cat;
        }

        cy.checkBlockPatternExists(args).then(exists => {
          assert(
            exists === testCase.expected,
            `Pattern "${testCase.title}" in category "${testCase.cat}": ${testCase.expected}`
          );
        });
      });
    });
  } else {
    it('Skip checkBlockPatternExists test, WordPress version too low', () => {
      assert(true);
    });
  }
});
