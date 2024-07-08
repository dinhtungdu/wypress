"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wpCliEval = void 0;
/**
 * Run PHP code as WP CLI eval-file command
 *
 * @param command - PHP code to execute with WP CLI. The '<?php ' prefix is optional.
 *
 * @example
 * ```
 * cy.wpCliEval('<?php for($i=0; $i<10; $i++) { echo $i; }').then(response=>{
 *   const output = response.stdout;
 *   // Do whatever with the output.
 * })
 * ```
 */
const wpCliEval = (command) => {
    const fileName = (Math.random() + 1).toString(36).substring(7);
    // this will be written "local" plugin directory
    const escapedCommand = command.replace(/^<\?php /, '');
    cy.writeFile(fileName, `<?php ${escapedCommand}`);
    cy.exec('echo $(basename $(pwd))').then(result => {
        const pluginName = result.stdout;
        // which is read from it's proper location in the plugins directory
        cy.exec(`npm --silent run env run tests-cli -- wp eval-file wp-content/plugins/${pluginName}/${fileName}` // eslint-disable-line @typescript-eslint/restrict-template-expressions
        ).then(result => {
            cy.exec(`rm ${fileName}`);
            cy.wrap(result);
        });
    });
};
exports.wpCliEval = wpCliEval;
