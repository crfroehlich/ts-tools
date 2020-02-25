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
  ignore: ['**/node_modules/**', '.vscode/**', '**/*/tsconfig.json', '**/*nyc_output/**'],
  realPath: true,
};

const defaultCallback = (er: unknown, files: string[]): void => {
  if (er) {
    console.error(er);
  }
  files.forEach((fileName) => {
    try {
      const file = readFileSync(fileName, 'utf-8');
      let json;
      try {
        json = JSON.parse(file);
      } catch (e) {
        console.log(`Error: parsing ${file}.`);
        throw new Error(e);
      }
      const sorted = sortedJson.sortify(json);
      writeFileSync(fileName, JSON.stringify(sorted, null, 2));
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
