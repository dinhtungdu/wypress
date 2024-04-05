/**
 * Open Document Settings Sidebar
 *
 * @param tab - Name of the tab
 *
 * @example
 * Open 'Post' tab
 * ```
 * cy.openDocumentSettingsSidebar()
 * ```
 *
 * @example
 * Open 'Block' tab
 * ```
 * cy.openDocumentSettingsSidebar('Block')
 * ```
 */
export const openDocumentSettingsSidebar = (tab = 'Post'): void => {
  cy.get('body').then($body => {
    const $settingButtonIds = [
      'button[aria-expanded="false"][aria-label="Settings"]',
    ];

    $settingButtonIds.forEach($settingButtonId => {
      if ($body.find($settingButtonId).length) {
        cy.get($settingButtonId).click();
        cy.wrap($body.find($settingButtonId)).as('sidebarButton');
      }
    });

    const $tabSelectors = [
      `div[role="tablist"] button:contains("${tab}")`,
      `.edit-post-sidebar__panel-tabs button:contains("${tab}")`,
    ];

    $tabSelectors.forEach($tabSelector => {
      if ($body.find($tabSelector).length) {
        cy.get($tabSelector).click();
        cy.wrap($body.find($tabSelector)).as('selectedTab');
      }
    });
  });
};
