"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertBlock = void 0;
const get_iframe_1 = require("../functions/get-iframe");
/**
 * Inserts Block
 *
 * The resulting block id is yielded
 *
 * @param type - Block type
 * @param name - Block name (used to search)
 *
 * @example
 * ```
 * cy.insertBlock('core/heading').then(id => {
 *   cy.get(`#${id}`).click().type('A quick brown fox');
 * });
 * ```
 */
const insertBlock = (type, name) => {
    const [namespace = '', ...blockNameRest] = type.split('/');
    let blockNames = [
        blockNameRest.join('/').replace('/', '-'),
        blockNameRest.join('/').replace('/', '\\/'),
    ];
    blockNames = blockNames.filter((x, i, a) => a.indexOf(x) == i);
    // let blockName = blockNameRest.join('/').replace( '/', '\\/' );
    let inserterBtn;
    let search = '';
    if (typeof name === 'string' && name.length) {
        search = name;
    }
    else {
        search = type;
    }
    // Start of block inserter toggle button click logic.
    cy.get('body').then($body => {
        const selectors = [
            'button[aria-label="Add block"]',
            'button[aria-label="Toggle block inserter"]', // 6.4
        ];
        selectors.forEach(selector => {
            if ($body.find(selector).length) {
                cy.get(selector).then($button => {
                    if ($button.length) {
                        inserterBtn = cy.wrap($button);
                        inserterBtn.first().click();
                    }
                });
            }
        });
    });
    // End of block inserter toggle button click logic.
    // Start of Block tab click logic.
    cy.get('button[role="tab"]')
        .contains('Blocks')
        .then($tab => {
        if ($tab.length) {
            cy.wrap($tab).click();
        }
    });
    // End of Block tab click logic.
    // Start of Block search logic.
    cy.get('input[placeholder="Search"]').then($input => {
        if ($input.length) {
            cy.wrap($input).type(search);
        }
    });
    // End of Block search logic.
    blockNames.forEach(blockName => {
        const blockSelector = `.editor-block-list-item-${'core' === namespace ? '' : namespace + '-'}${blockName}`;
        cy.get('body').then($body => {
            if ($body.find(blockSelector).length) {
                // Start of Block insertion by click logic.
                cy.get(blockSelector).then($block => {
                    if ($block.length) {
                        cy.wrap($block).click();
                        inserterBtn.click();
                        const [ns, rest] = type.split('/'); // namespace = ns, second namespace or block name = rest
                        cy.get('body').then($body => {
                            if ($body.find('iframe[name="editor-canvas"]').length) {
                                // Works with WP 6.4
                                (0, get_iframe_1.getIframe)('iframe[name="editor-canvas"]').then($iframe => {
                                    const blockInIframe = $iframe.find(`.wp-block[data-type="${ns}/${rest}"]`);
                                    if (blockInIframe.length > 0) {
                                        expect(blockInIframe.length).to.equal(1);
                                        cy.wrap(blockInIframe.prop('id'));
                                    }
                                });
                            }
                            else if ($body.find(`.wp-block[data-type="${ns}/${rest}"]`).length) {
                                // Works with WP 5.7
                                cy.get(`.wp-block[data-type="${ns}/${rest}"]`).then($blockInEditor => {
                                    expect($blockInEditor.length).to.equal(1);
                                    cy.wrap($blockInEditor.prop('id'));
                                });
                            }
                            else {
                                throw new Error(`${ns}/${rest} not found.`);
                            }
                        });
                    }
                });
                // End of Block insertion by click logic.
            }
        });
    });
};
exports.insertBlock = insertBlock;
