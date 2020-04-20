import { execSync } from 'child_process';
import { getLogger } from '../logger/logger';

const log = getLogger();
const prompts = require('prompts');
const ghpages = require('gh-pages');

/**
 * Generates API docs for every documented class/method/interface/enum
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

  const publishApiDocs = () => {
    ghpages.publish('api', (err: Error) => {
      if (err) {
        log.error('Failed', err);
      }
    });
  };

  // If we're in CI, publish to GitHub Pages
  if (process.env.CI) {
    publishApiDocs();
  } else {
    // If we ever want to allow devs to push directly to the gh-pages branch, this will do it
    /*
      const confirm = await prompts({
        type: 'confirm',
        name: 'yesno',
        message: 'You are about to to publish the API documentation to GitHub Pages. Are you sure? Y/n',
      });
      if (confirm.yesno) {
        publishApiDocs();
      } else {
        log.info('User cancelled operation');
      }
    */
  }
};

if (__filename === process?.mainModule?.filename) {
  generateApiDocs();
}
