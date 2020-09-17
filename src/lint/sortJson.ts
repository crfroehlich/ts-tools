#!/usr/bin/env node
/*
  eslint-disable
    @typescript-eslint/no-explicit-any,
    no-param-reassign,
*/
import glob from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { getCliLogger } from '../logger';
import { GLOB_OPTIONS, GlobOptions, globCallback } from '../env/files';
import { EnvVariables, loadEnv } from '../env/loadEnv';
import { isIgnored, isRunAsScript } from '../utils/utils';

const sortedJson = require('sorted-json');

const log = getCliLogger('js-tools/sort-json');

const env = loadEnv();

// Sort all the JSON files to improve readability and reduce conflicts
const defaultPath = '**/*.json';

// Parse the package JSON for script and environment variable documentation
// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
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
  const definedEnvKeys = readFileSync('.env.schema').toString().replace(/=/g, '').split('\n').filter(Boolean);
  const envKeys = Object.keys(env).filter((key) => definedEnvKeys.includes(key));
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
    if (env?.IGNORE_PEER_DEPENDENCIES) {
      const ignored: string[] = env.IGNORE_PEER_DEPENDENCIES.split(',');
      const peerDepKeys = Object.keys(json.dependencies).filter((key) => !ignored.includes(key));
      json.peerDependencies = {};
      peerDepKeys.forEach((key) => {
        json.peerDependencies[key] = json.dependencies[key];
      });
    } else {
      // Sync peerDependencies
      json.peerDependencies = json.dependencies;
    }
  }
  return json;
};

const defaultCallback = (er: Error | null, files: string[]): void => {
  if (er) {
    log.error('File parsing failed', er);
  }
  files.forEach((fileName) => {
    try {
      if (isIgnored(EnvVariables.IGNORE_JSON_FILES, fileName)) return;

      const file = readFileSync(fileName, 'utf-8');
      let json: any;
      try {
        json = JSON.parse(file);
      } catch (e) {
        log.info(`Skipped ${fileName}.`);
        return;
      }
      if (fileName === 'package.json') {
        parsePackageJson(json);
      }

      const sorted = sortedJson.sortify(json);
      const stringified = JSON.stringify(sorted, null, 2).concat('\n');
      writeFileSync(fileName, stringified);
      log.info(`Alpha-sorted ${fileName} JSON file`);
    } catch (err) {
      log.error(`Error: parsing ${fileName}.`, err);
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

if (isRunAsScript(__filename)) {
  sortJson();
}
