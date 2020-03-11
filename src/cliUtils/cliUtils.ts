import { promisify } from 'util';
import * as readline from 'readline';
import { fstat } from 'fs';

/*
 * Read and concatenate lines from stdin.
 *
 * @returns a string comprised of the concatenated lines read from stdin.
 */
export async function getContentFromStdin(): Promise<Error | string> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    let content = '';

    rl.on('line', function onLine(line) {
      content += line;
    });

    rl.on('error', function onError(error) {
      return reject(new Error(error));
    });

    rl.on('close', function onClose() {
      return resolve(content);
    });
  });
}

/*
 * @returns a boolean indicating whether stdin is a pipe or not.
 */
export async function isPipe(): Promise<boolean> {
  /*
   * note: process.stdin.isTTY isn't correct if this is a child_process
   */

  try {
    const stats = await promisify(fstat)(0);
    return stats.isFIFO();
  } catch (e) {
    throw new Error(`Error: failed to check stdin with fstat. ${e}`);
  }
}

export function isRunAsScript(): boolean {
  return process?.mainModule?.filename === __filename;
}
