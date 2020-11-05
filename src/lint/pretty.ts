/* istanbul ignore file */

import { Options, format } from 'prettier';
import glob from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { getCliLogger } from '../logger';
import { GLOB_OPTIONS, GlobOptions, globCallback } from '../env/files';
import { isRunAsScript } from '../utils/utils';

const prettierConfig: Options = {
  parser: 'markdown',
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 120,
  arrowParens: 'always',
  useTabs: false,
};

/**
 * Formats markdown content according to the prettier config
 * @public
 */
export const prettyMarkdown = (input: string): string => {
  return format(input, prettierConfig);
};

const log = getCliLogger('ts-tools/pretty');

// Prettier all the source code
const defaultPath = '**/*.ts';

/* eslint-disable-next-line complexity, sonarjs/cognitive-complexity */
const defaultCallback = (er: Error | null, files: string[]): void => {
  if (er) {
    log.error('Prettier failed', er);
  }
  files.forEach((fileName) => {
    try {
      const file = readFileSync(fileName, 'utf-8');
      const pretty = format(file, prettierConfig);
      writeFileSync(fileName, pretty);
    } catch (err) {
      log.error(`Error: parsing ${fileName}.`, err);
    }
  });
};

/**
 * Runs format against a directory
 * @public
 */
export const prettify = (
  path: string = defaultPath,
  options: GlobOptions = GLOB_OPTIONS,
  callback: globCallback = defaultCallback,
): void => {
  glob(path, options, callback);
};

if (isRunAsScript(__filename)) {
  prettify();
}
