"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBlockPatternExists = void 0;
const checkBlockPatternExists = ({ title, categoryValue = 'featured', }) => {
    // opening the inserter loads the patterns in WP trunk after 6.4.3.
    cy.get('button[class*="__inserter-toggle"][aria-pressed="false"]').click();
    cy.get('button[class*="__inserter-toggle"][aria-pressed="true"]').click();
    cy.window()
        .then(win => {
        /* eslint-disable */
        return new Promise(resolve => {
            let elapsed = 0;
            const inverval = setInterval(function () {
                var _a, _b;
                if (elapsed > 2500) {
                    clearInterval(inverval);
                    resolve(false);
                }
                const { wp } = win;
                let allRegisteredPatterns;
                if ((_b = (_a = wp === null || wp === void 0 ? void 0 : wp.data) === null || _a === void 0 ? void 0 : _a.select('core')) === null || _b === void 0 ? void 0 : _b.getBlockPatterns) {
                    allRegisteredPatterns = wp.data.select('core').getBlockPatterns();
                }
                else {
                    allRegisteredPatterns = wp.data
                        .select('core/block-editor')
                        .getSettings().__experimentalBlockPatterns;
                }
                if (undefined !== allRegisteredPatterns) {
                    for (let i = 0; i < allRegisteredPatterns.length; i++) {
                        if (title === allRegisteredPatterns[i].title &&
                            allRegisteredPatterns[i].categories &&
                            allRegisteredPatterns[i].categories.includes(categoryValue)) {
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
exports.checkBlockPatternExists = checkBlockPatternExists;
