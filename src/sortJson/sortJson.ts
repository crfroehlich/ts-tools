import glob from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { LogLevel, LogOutput, getLogger } from '../logger';

const sortedJson = require('sorted-json');

type globCallback = (err: Error | null, matches: string[]) => void;
export interface GlobOptions {
  dot?: boolean;
  ignore?: string[];
  realPath?: boolean;
}

const log = getLogger(
  {
    logLevel: LogLevel.INFO,
    serviceName: 'js-tools/sort-json',
    transports: [LogOutput.CONSOLE],
  },
  true,
);

// Sort all the JSON files to improve readability and reduce conflicts
const defaultPath = '**/*.json';
const defaultOptions = {
  dot: true,
  ignore: ['**/node_modules/**', '.vscode/**', '**/*/tsconfig.json', '**/*nyc_output/**'],
  realPath: true,
};

const defaultCallback = (er: Error | null, files: string[]): void => {
  if (er) {
    log.error(er.toString());
  }
  files.forEach((fileName) => {
    try {
      const file = readFileSync(fileName, 'utf-8');
      let json;
      try {
        json = JSON.parse(file);
      } catch (e) {
        log.error(`Error: parsing ${file}.`);
        throw new Error(e);
      }
      const sorted = sortedJson.sortify(json);
      writeFileSync(fileName, JSON.stringify(sorted, null, 2));
      log.info(`Alpha-sorted ${fileName} JSON file`);
    } catch (err) {
      log.error(`${fileName}: failed`);
      log.error(err);
    }
  });
};

export const sortJson = (
  path: string = defaultPath,
  options: GlobOptions = defaultOptions,
  callback: globCallback = defaultCallback,
): void => {
  glob(path, options, callback);
};

if (__filename === process?.mainModule?.filename) {
  sortJson();
}
