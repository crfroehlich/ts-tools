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
