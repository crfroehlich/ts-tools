/* eslint-disable no-console */
import glob from 'glob';
import { readFileSync, writeFileSync } from 'fs';

const sortedJson = require('sorted-json');

type globCallback = (err: Error | null, matches: string[]) => void;
interface GlobOptions {
  dot?: boolean;
  ignore?: string[];
  realPath?: boolean;
}

// Sort all the JSON files to improve readability and reduce conflicts
const defaultPath = '**/*.json';
const defaultOptions = {
  dot: true,
  ignore: ['**/node_modules/**', '.vscode/**', '**/*/tsconfig.json'],
  realPath: true,
};

const defaultCallback = (er: unknown, files: string[]): void => {
  if (er) {
    console.error(er);
  }
  files.forEach((fileName) => {
    try {
      const file = readFileSync(fileName, 'utf-8');
      const json = JSON.parse(file);
      const sorted = sortedJson.sortify(JSON.stringify(json, null, 2));
      writeFileSync(fileName, sorted);
      console.info(`Alpha-sorted ${fileName} JSON file`);
    } catch (err) {
      console.error(`${fileName}: failed`);
      console.error(err);
    }
  });
};

export default function sortJson(
  path: string = defaultPath,
  options: GlobOptions = defaultOptions,
  callback: globCallback = defaultCallback,
): void {
  glob(path, options, callback);
}

if (__filename === process?.mainModule?.filename) {
  sortJson();
}
