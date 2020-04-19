/*
  eslint-disable
    @typescript-eslint/no-explicit-any,
    no-param-reassign,
*/
import glob from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { LogLevel, LogOutput, getLogger } from '../logger';
import { GLOB_OPTIONS, GlobOptions, globCallback } from '../env/files';
import { loadEnv } from '../env/loadEnv';

const sortedJson = require('sorted-json');

const log = getLogger(
  {
    logLevel: LogLevel.INFO,
    serviceName: 'js-tools/sort-json',
    transports: [LogOutput.CONSOLE],
  },
  true,
);

const env = loadEnv();

// Sort all the JSON files to improve readability and reduce conflicts
const defaultPath = '**/*.json';

// Parse the package JSON for script and environment variable documentation
const parsePackageJson = (json: any): any => {
  if (json.scripts) {
    if (!json.scriptsDocumentation) {
      json.scriptsDocumentation = {};
    }
    const scriptKeys = Object.keys(json.scripts);
    scriptKeys.forEach((key) => {
      if (!json.scriptsDocumentation[key]) {
        json.scriptsDocumentation[key] = {
          description: `Please document the <${key}> script.`,
          dev: true,
        };
      }
    });
    const docKeys = Object.keys(json.scriptsDocumentation);
    docKeys.forEach((key) => {
      if (!json.scripts[key]) {
        delete json.scriptsDocumentation[key];
      }
    });
  }
  if (!json.envDocumentation) {
    json.envDocumentation = {};
  }
  const envKeys = Object.keys(env);
  envKeys.forEach((key) => {
    if (!json.envDocumentation[key]) {
      json.envDocumentation[key] = {
        description: `Please document the <${key}> variable`,
      };
    }
  });
  const envDocKeys = Object.keys(json.envDocumentation);
  envDocKeys.forEach((key) => {
    if (!envKeys.find((k) => k === key)) {
      delete json.envDocumentation[key];
    }
  });
  return json;
};

const defaultCallback = (er: Error | null, files: string[]): void => {
  if (er) {
    log.error(er.toString());
  }
  files.forEach((fileName) => {
    try {
      const file = readFileSync(fileName, 'utf-8');
      const json: any = JSON.parse(file);
      if (fileName === 'package.json') {
        parsePackageJson(json);
      }

      const sorted = sortedJson.sortify(json);

      writeFileSync(fileName, JSON.stringify(sorted, null, 2));
      log.info(`Alpha-sorted ${fileName} JSON file`);
    } catch (err) {
      log.error(`Error: parsing ${fileName}. Message: ${err.message}`);
    }
  });
};

/**
 * Iterates over all JSON files and alpha sorts them
 * @remarks This excludes files not in VCS
 * @public
 */
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
