/* eslint-disable
  @typescript-eslint/no-explicit-any,
  complexity,
  sonarjs/cognitive-complexity,
*/
import { execSync } from 'child_process';
import { getLogger } from '../logger/logger';

const ghpages = require('gh-pages');
const prompts = require('prompts');

const log = getLogger();

/**
 * Generates API docs for every documented class/method/interface/enum.
 * @param params - Optional list of command line params
 * @public
 * @returns async void
 */
export const generateApiDocs = async (params?: string): Promise<void> => {
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

  const publish = (): any => {
    // Publish to the `gh-pages` branch
    return ghpages.publish('api', (err: Error) => {
      if (err) {
        log.error('Failed', err);
      }
    });
  };

  // If we're not in CI, allow the user to confirm before they deploy
  if (!process.env.CI) {
    const confirm = await prompts({
      type: 'confirm',
      name: 'yesno',
      message: 'You are about to to publish the API documentation to GitHub Pages. Are you sure? Y/n',
    });
    if (confirm.yesno) {
      publish();
    } else {
      log.info('User cancelled operation');
    }
  } else {
      // If we're in CI, generate and publish the docs
    publish();
  }
};

if (__filename === process?.mainModule?.filename) {
  generateApiDocs();
}
