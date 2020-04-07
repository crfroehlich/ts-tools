import glob from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { LogLevel, LogOutput, getLogger } from '../logger';
import { GLOB_OPTIONS, GlobOptions, globCallback } from '../env/files';

const sortedJson = require('sorted-json');

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
  options: GlobOptions = GLOB_OPTIONS,
  callback: globCallback = defaultCallback,
): void => {
  glob(path, options, callback);
};

if (__filename === process?.mainModule?.filename) {
  sortJson();
}
