/**
 * Determines if the util is being run as a script
 * @public
 * @param fileName - The file we are checking as the initial file callig the logic
 * @returns a boolean with true if the process is being ran as a script, otherwise false
 */
/* istanbul ignore next */
export const isRunAsScript = (fileName: string): boolean => fileName === require.main?.filename;
