/* eslint-disable no-console */
import { execSync } from 'child_process';
const prompts = require('prompts');

/**
 * Generates API docs for every documented class/method/interface/enum
 * @param params Optional list of command line params
 */
export const generateApiDocs = async (params?: string): Promise<void> => {

  // Get any command line arguments that might have been passed
  const args = process.argv.slice(2);

  const processCommand = () => {

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
  };
  processCommand();
};

if (__filename === process?.mainModule?.filename) {
  generateApiDocs();
}
