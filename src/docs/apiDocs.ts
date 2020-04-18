/* eslint-disable no-console */
import { execSync } from 'child_process';
const prompts = require('prompts');
const ghpages = require('gh-pages');

/**
 * Generates API docs for every documented class/method/interface/enum
 * @param params Optional list of command line params
 */
export const generateApiDocs = async (params?: string): Promise<void> => {

  let command = `api-documenter markdown --input-folder temp --output-folder api`;
  if (params) {
    command += ` ${params}`;
  }
  const cwd = `${process.cwd()}`;
  console.info(`Running ${command} in ${cwd}`);

  try {
    execSync(command, { cwd, stdio: 'inherit' });
  } catch (error) {
    console.error(error);
  }

  const publishApiDocs = () => {
    ghpages.publish('api', (err: Error) => {
      if (err) {
        console.error(err);
      }
    });
  }

  // If we're not in CI, allow the user to confirm before they deploy
  if (!process.env.CI) {
    const confirm = await prompts({
      type: 'confirm',
      name: 'yesno',
      message: `You are about to to publish the API documentation to GitHub Pages'. Are you sure? Y/n`,
    });
    if (confirm.yesno) {
      publishApiDocs();
    } else {
      console.log('User cancelled operation');
    }
  } else {
    publishApiDocs();
  }
};

if (__filename === process?.mainModule?.filename) {
  generateApiDocs();
}
