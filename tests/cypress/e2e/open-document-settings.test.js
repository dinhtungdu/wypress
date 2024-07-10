import { compare } from 'compare-versions';
const { randomName } = require('../support/functions');
import { getIframe } from '../../../lib/functions/get-iframe';

describe('Commands: openDocumentSettings*', () => {
  before(() => {
    cy.login();

    cy.deactivatePlugin('classic-editor');

    // Disable Classic Editor if it's enabled
    cy.visit('/wp-admin/options-writing.php');
    cy.get('body').then($body => {
      if (
        $body.find('.classic-editor-options').length !== 0 &&
        $body.find('#classic-editor-classic').is(':checked')
      ) {
        cy.get('#classic-editor-block').click();
        cy.get('#submit').click();
      }
    });

    // Ignore WP 5.2 Synchronous XHR error.
    Cypress.on('uncaught:exception', (err, runnable) => {
      if (
        err.message.includes(
          "Failed to execute 'send' on 'XMLHttpRequest': Failed to load 'http://localhost:8889/wp-admin/admin-ajax.php': Synchronous XHR in page dismissal"
        )
      ) {
        return false;
      }
    });
  });

  beforeEach(() => {
    cy.login();
  });

  it("Should be able to open (don't close) Status Panel on a new post", () => {
    cy.visit(`/wp-admin/post-new.php`);
    cy.closeWelcomeGuide();

    // WP 6.1 renamed the panel name "Status & visibility" to "Summary".
    cy.openDocumentSettingsSidebar('Post');
    cy.get('body').then($body => {
      let name = 'Status & visibility';
      if (
        $body.find(
          '.components-panel__body .components-panel__body-title button:contains("Summary")'
        ).length > 0
      ) {
        name = 'Summary';
      }
      // WP 6.6 handling.
      if ($body.find('.editor-post-summary').length === 0) {
        cy.openDocumentSettingsPanel(name);
        // Assertion: Stick to the top checkbox should be visible
        cy.get('.components-panel__body .components-panel__body-title button')
          .contains(name, { matchCase: false })
          .then($button => {
            const $panel = $button.parents('.components-panel__body');
            cy.wrap($panel).should('contain', 'Stick to the top of the blog');
          });
      } else {
        cy.get('.editor-post-sticky__toggle-control').should('be.visible');
      }
    });
  });

  it('Should be able to open Tags panel on the existing post', () => {
    cy.createPost({
      title: randomName(),
    }).then(post => {
      cy.visit(`/wp-admin/post.php?post=${post.id}&action=edit`);
      cy.closeWelcomeGuide();

      const name = 'Tags';
      cy.openDocumentSettingsPanel(name);

      // Assertion: Add new tag input should be visible
      cy.get('.components-panel__body .components-panel__body-title button')
        .contains(name)
        .then($button => {
          const $panel = $button.parents('.components-panel__body');
          cy.wrap($panel).should('contain', 'Add New Tag');
        });
    });
  });

  it('Should be able to open Discussion panel on the existing page', () => {
    if (compare(Cypress.env('WORDPRESS_CORE').toString(), '6.6', '>=')) {
      assert(true, 'Skipping test');
      return;
    }

    cy.createPost({
      title: randomName(),
      postType: 'page',
    }).then(post => {
      cy.visit(`/wp-admin/post.php?post=${post.id}&action=edit`);
      cy.closeWelcomeGuide();

      const name = 'Discussion';
      cy.openDocumentSettingsPanel(name, 'Page');

      // Assertion: Allow comments checkbox should be visible
      cy.get('.components-panel__body .components-panel__body-title button')
        .contains(name)
        .then($button => {
          const $panel = $button.parents('.components-panel__body');
          cy.wrap($panel)
            .contains('Allow comments', { matchCase: false })
            .should('exist');
        });
    });
  });

  it('Should be able to Open Post Settings Sidebar on a new Post', () => {
    cy.visit(`/wp-admin/post-new.php`);
    cy.closeWelcomeGuide();

    cy.openDocumentSettingsSidebar();

    cy.get('body').then($body => {
      if ($body.find('div[role="tablist"]').length) {
        cy.get('@selectedTab').should('have.attr', 'aria-selected', 'true');
      } else if ($body.find('.edit-post-sidebar__panel-tabs').length) {
        cy.get('@selectedTab').should('have.class', 'is-active');
      }
    });
  });

  it('Should be able to Open Block tab of the first block on existing post', () => {
    cy.createPost({
      title: randomName(),
    }).then(post => {
      cy.visit(`/wp-admin/post.php?post=${post.id}&action=edit`);
      cy.closeWelcomeGuide();

      cy.get('body').then($body => {
        if ($body.find('iframe[name="editor-canvas"]').length) {
          if (
            getIframe('iframe[name="editor-canvas"]').find(
              '.wp-block-post-content > .wp-block'
            ).length > 0
          ) {
            getIframe('iframe[name="editor-canvas"]')
              .find('.wp-block-post-content > .wp-block')
              .first()
              .click();
          } else {
            // Fallback for WordPress 5.7
            getIframe('iframe[name="editor-canvas"]')
              .find('.block-editor-block-list__layout > .wp-block')
              .first()
              .click();
          }
        } else {
          if ($body.find('.wp-block-post-content > .wp-block').length > 0) {
            cy.get('.wp-block-post-content > .wp-block').first().click();
          } else {
            // Fallback for WordPress 5.7
            cy.get('.block-editor-block-list__layout > .wp-block')
              .first()
              .click();
          }
        }
      });

      cy.openDocumentSettingsSidebar('Block');

      // Assertions:
      cy.get('body').then($body => {
        if ($body.find('div[role="tablist"]').length) {
          cy.get('@selectedTab').should('have.attr', 'aria-selected', 'true');
        } else if ($body.find('.edit-post-sidebar__panel-tabs').length) {
          cy.get('@selectedTab').should('have.class', 'is-active');
        }
      });
    });
  });

  it('Should be able to open Page Settings sidebar on an existing page', () => {
    cy.createPost({
      title: randomName(),
      postType: 'page',
    }).then(post => {
      cy.visit(`/wp-admin/post.php?post=${post.id}&action=edit`);
      cy.closeWelcomeGuide();

      cy.openDocumentSettingsSidebar('Page');

      cy.get('body').then($body => {
        if ($body.find('div[role="tablist"]').length) {
          cy.get('@selectedTab').should('have.attr', 'aria-selected', 'true');
        } else if ($body.find('.edit-post-sidebar__panel-tabs').length) {
          cy.get('@selectedTab').should('have.class', 'is-active');
        }
      });
    });
  });
});
