/**
 * Perform a WP CLI command
 *
 * @param command - WP CLI command. The 'wp ' prefix is optional
 * @param ignoreFailures - Prevent command to fail if CLI command exits with error
 *
 * @example
 * ```
 * cy.wpCli('plugin list --field=name').then(response=>{
 *   const plugins = res.stdout.split('\n');
 *   // Do whatever with plugins list
 * });
 * ```
 */
export const wpCli = (command: string, ignoreFailures = false): void => {
  const escapedCommand = command.replace(/"/g, '\\"');
  const options = {
    failOnNonZeroExit: !ignoreFailures,
  };
  cy.exec(
    `npm --silent run env run tests-cli -- ${escapedCommand}`,
    options
  ).then(result => {
    cy.wrap(result);
  });
};
