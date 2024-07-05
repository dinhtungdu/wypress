const { randomName } = require('../support/functions');

describe('Command: createPost', () => {
  before(() => {
    cy.login();

    cy.deactivatePlugin('classic-editor');

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

  it('Should be able to create Post', () => {
    const title = 'Test Post';
    cy.createPost({
      title,
      content: 'Test Content',
    });

    cy.visit('/wp-admin/edit.php?orderby=date&order=desc');
    cy.get('#the-list td.title a.row-title').first().should('have.text', title);
  });

  it('Should be able to create Draft Post', () => {
    const title = 'Test Draft Post';
    cy.createPost({
      title,
      status: 'draft',
      content: 'Test Draft Content',
    });

    cy.visit('/wp-admin/edit.php?orderby=date&order=desc');
    cy.get('#the-list td.title')
      .first()
      .then($row => {
        cy.wrap($row).find('a.row-title').should('have.text', title);
        cy.wrap($row).find('span.post-state').should('have.text', 'Draft');
      });
  });

  it('Should be able to create Page', () => {
    const title = 'Test page';
    cy.createPost({
      title,
      content: 'page Content',
      postType: 'page',
    });

    cy.visit('/wp-admin/edit.php?post_type=page&orderby=date&order=desc');
    cy.get('#the-list td.title a.row-title').first().should('have.text', title);
  });

  it('Should be able to create Draft Page', () => {
    const title = 'Test Draft Page';
    cy.createPost({
      title,
      status: 'draft',
      content: 'Test Draft Content',
      postType: 'page',
    });

    cy.visit('/wp-admin/edit.php?post_type=page&orderby=date&order=desc');
    cy.get('#the-list td.title')
      .first()
      .then($row => {
        cy.wrap($row).find('a.row-title').should('have.text', title);
        cy.wrap($row).find('span.post-state').should('have.text', 'Draft');
      });
  });

  it('Should be able to use beforeSave hook', () => {
    const postTitle = 'Post ' + randomName();
    const postContent = 'Content ' + randomName();
    cy.createPost({
      title: postTitle,
      content: postContent,
      beforeSave: () => {
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

            cy.get('label')
              .contains('Stick to the top of the blog')
              .click()
              .parent()
              .find('input[type="checkbox"]')
              .should('be.checked');
          } else {
            cy.get('.editor-post-sticky__toggle-control').should('be.visible');
          }
        });
      },
    });

    cy.visit('/wp-admin/edit.php?post_type=post');
    cy.get('td.title')
      .contains(postTitle)
      .parent()
      .find('.post-state')
      .should('contain.text', 'Sticky');
  });

  it('Should be able to get published post details', () => {
    const postTitle = 'Post ' + randomName();
    const postContent = 'Content ' + randomName();
    cy.createPost({
      title: postTitle,
      content: postContent,
    }).then(post => {
      assert(post.title.raw === postTitle, 'Post title is the same');
      assert(
        post.content.rendered.includes(postContent),
        'Post content is the same'
      );
    });
  });

  it('Should be able to create Post without title', () => {
    cy.createPost({
      title: '',
      content: 'Test Content',
    });

    cy.visit('/wp-admin/edit.php?orderby=date&order=desc');
    cy.get('#the-list td.title a.row-title')
      .first()
      .should(element => {
        // WordPress changed the default title for posts without a title at some point.
        expect(element.text()).to.be.oneOf(['(no title)', 'Untitled']);
      });
  });

  it('Should be able to create Post without content', () => {
    const title = 'No Content Post';
    cy.createPost({
      title,
      content: '',
    }).then(post => {
      assert(post.title.raw === title, 'Post title is the same');
      assert(post.content.rendered.length === 0, 'Post content is empty');
    });
  });
});
