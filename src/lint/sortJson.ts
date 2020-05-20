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
import { isRunAsScript } from '../cliUtils/cliUtils';

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
  // Sync the scripts with their docs
  if (json.scripts) {
    if (!json.scriptsDocumentation) {
      json.scriptsDocumentation = {};
    }
    // For each script, if no doc is defined, create it
    const scriptKeys = Object.keys(json.scripts);
    scriptKeys.forEach((key) => {
      if (!json.scriptsDocumentation[key]) {
        json.scriptsDocumentation[key] = {
          description: `Please document the <${key}> script.`,
          dev: true,
        };
      }
    });
    // If any doc exists for an undefined script, delete the doc
    const docKeys = Object.keys(json.scriptsDocumentation);
    docKeys.forEach((key) => {
      if (!json.scripts[key]) {
        delete json.scriptsDocumentation[key];
      }
    });
  }
  // Sync the environment variables
  if (!json.envDocumentation) {
    json.envDocumentation = {};
  }
  // For each environment variable, if no doc exists, create it
  const envKeys = Object.keys(env);
  envKeys.forEach((key) => {
    if (!json.envDocumentation[key]) {
      json.envDocumentation[key] = {
        description: `Please document the <${key}> variable`,
      };
    }
  });
  // For each doc, if no env exists, delete the doc
  const envDocKeys = Object.keys(json.envDocumentation);
  envDocKeys.forEach((key) => {
    if (!envKeys.find((k) => k === key)) {
      delete json.envDocumentation[key];
    }
  });
  if (env?.SYNC_PEER_DEPENDENCIES?.toLowerCase() === 'true') {
    // Sync peerDependencies
    json.peerDependencies = json.dependencies;
  }
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
 * @remarks
 * This excludes files not in VCS
 * @public
 */
export const sortJson = (
  path: string = defaultPath,
  options: GlobOptions = GLOB_OPTIONS,
  callback: globCallback = defaultCallback,
): void => {
  glob(path, options, callback);
};

if (isRunAsScript()) {
  sortJson();
}
