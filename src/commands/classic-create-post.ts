import PostData from '../interface/post-data';

/**
 * Create Post in Classic Editor
 *
 * @param postData - Post data.
 *
 * @example
 * ```
 * cy.classicCreatePost({
 *   title: 'Post title',
 *   content: 'Post content',
 *   beforeSave: () => {
 *     // Do something before save.
 *   },
 *   postType: 'page',
 *   status: 'draft'
 * }).then(postID => {
 *   cy.log(postID);
 * })
 * ```
 */
export const classicCreatePost = ({
  postType = 'post',
  title = 'Test Post',
  content = 'Test content',
  status = 'publish',
  beforeSave,
}: PostData): void => {
  cy.visit(`/wp-admin/post-new.php?post_type=${postType}`);

  cy.get('#title').click().clear().type(title);

  cy.get('#content_ifr').then($iframe => {
    const doc = $iframe.contents().find('body#tinymce');
    cy.wrap(doc).find('p:last-child').type(content);
  });

  if ('undefined' !== typeof beforeSave) {
    beforeSave();
  }

  cy.intercept('POST', '/wp-admin/post.php', req => {
    req.alias = 'savePost';
  });

  if ('draft' === status) {
    cy.get('#save-post').should('not.have.class', 'disabled').click();
  } else {
    cy.get('#publish').should('not.have.class', 'disabled').click();
  }

  cy.wait('@savePost').then(response => {
    const body = new URLSearchParams(response.request?.body);
    const id = body.get('post_ID');
    cy.wrap(id);
  });
};
