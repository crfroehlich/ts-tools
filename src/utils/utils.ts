/* istanbul ignore file */
import { getCliLogger } from '../logger';
import { EnvVariables, loadEnv } from '../env/loadEnv';

const env = loadEnv();
const log = getCliLogger('js-tools');

/**
 * Determines if the util is being run as a script
 * @public
 * @param fileName - The file we are checking as the initial file callig the logic
 * @returns a boolean with true if the process is being ran as a script, otherwise false
 */
/* istanbul ignore next */
export const isRunAsScript = (fileName: string): boolean => fileName === require.main?.filename;

/**
 * Mechanism for synchronous wait.
 * Usage: `await this.sleep(5000)`
 * @param milliseconds - the number of milliseconds to wait
 * @internal
 */
export const sleep = async (milliseconds = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/**
 * Fetches a list of files, filtered by an ignore list
 * @param envIgnoreFiles - environment variable to use for lists of ignored files
 * @param exclude - manual overrides to the ignore files list
 * @internal
 */
export const getIgnoredFiles = (envIgnoreFiles: EnvVariables, exclude = ''): string[] => {
  const envIgnored = env[envIgnoreFiles]?.length > 0 ? env[envIgnoreFiles].split(',') : [];
  const ignored = [
    'project-api.md',
    'pull_request_template.md',
    '.github',
    'temp',
    '.yarn',
    '*.tmp',
    '.yarn/',
    '*.git',
  ].concat(envIgnored);
  return ignored.filter((name, index) => {
    return ignored.indexOf(name) === index || (exclude.length > 0 && ignored.indexOf(exclude) < 0);
  });
};

/**
 * Returns true if the fileName is in the ignore pattern
 * @param envIgnoreFiles - environment variable to use for ignoring files
 * @param fileName - name of path to ignore
 * @param exclude - optional string value of path(s) to exclude from the ignore equation
 * @public
 */
export const isIgnored = (envIgnoreFiles: EnvVariables, fileName: string, exclude = ''): boolean => {
  const ignoreList = getIgnoredFiles(envIgnoreFiles, exclude);
  return ignoreList.some((i) => fileName.indexOf(i) > -1);
};
