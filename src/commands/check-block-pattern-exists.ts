/* eslint-disable tsdoc/syntax */
/**
 * Check Block Pattern Exists. Works only with WordPress \>=5.5
 *
 * \@param postData {
 *          `title` - Patttern name/title,
 *          `categoryValue` - Value of the pattern category,
 *        }
 *
 * @example
 * For WP v5.5
 * ```
 * cy.checkBlockPatternExists({
 *    title: 'Two buttons',
 * });
 * ```
 *
 * @example
 * For WP v5.9
 * ```
 * cy.checkBlockPatternExists({
 *    title: 'Three columns with offset images',
 *    categoryValue: 'gallery',
 * });
 * ```
 */
declare global {
  interface Window {
    wp: any;
  }
}

export const checkBlockPatternExists = ({
  title,
  categoryValue = 'featured',
}: {
  title: string;
  categoryValue?: string;
}): void => {
  // opening the inserter loads the patterns in WP trunk after 6.4.3.
  cy.get('button[class*="__inserter-toggle"][aria-pressed="false"]').click();
  cy.get('button[class*="__inserter-toggle"][aria-pressed="true"]').click();

  cy.window()
    .then(win => {
      /* eslint-disable */
      return new Promise(resolve => {
        let elapsed = 0;

        const inverval = setInterval(function () {
          if (elapsed > 2500) {
            clearInterval(inverval);
            resolve(false);
          }

          const { wp } = win;

          let allRegisteredPatterns;

          if (wp?.data?.select('core')?.getBlockPatterns) {
            allRegisteredPatterns = wp.data.select('core').getBlockPatterns();
          } else {
            allRegisteredPatterns = wp.data
              .select('core/block-editor')
              .getSettings().__experimentalBlockPatterns;
          }

          if (undefined !== allRegisteredPatterns) {
            for (let i = 0; i < allRegisteredPatterns.length; i++) {
              if (
                title === allRegisteredPatterns[i].title &&
                allRegisteredPatterns[i].categories &&
                allRegisteredPatterns[i].categories.includes(categoryValue)
              ) {
                resolve(true);
                return;
              }
            }
          }
          elapsed += 100;
        }, 100);
      });
    })
    .then(val => {
      /* eslint-enable */
      cy.wrap(val);
    });
};
