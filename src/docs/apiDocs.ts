import { execSync } from 'child_process';
import { getLogger } from '../logger/logger';

const log = getLogger();
const ghpages = require('gh-pages');

/**
 * Generates API docs for every documented class/method/interface/enum.
 * @param params - Optional list of command line params
 * @public
 * @returns async void
 */
export const generateApiDocs = async (params?: string): Promise<void> => {
  // If we're in CI, generate and publish the docs
  if (process.env.CI) {
    let command = 'api-documenter markdown --input-folder temp --output-folder api';
    if (params) {
      command += ` ${params}`;
    }
    const cwd = `${process.cwd()}`;
    log.info(`Running ${command} in ${cwd}`);

    try {
      execSync(command, { cwd, stdio: 'inherit' });
    } catch (error) {
      log.error(error);
    }

    // Publish to the `gh-pages` branch
    ghpages.publish('api', (err: Error) => {
      if (err) {
        log.error('Failed', err);
      }
    });
  }
};

if (__filename === process?.mainModule?.filename) {
  generateApiDocs();
}
