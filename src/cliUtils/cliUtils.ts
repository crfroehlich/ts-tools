/**
 * Determines if the util is being run as a script
 * @public
 * @returns a boolean with true if the process is being ran as a script, otherwise false
 */
/* istanbul ignore next */
export const isRunAsScript = (): boolean => __filename === require.main?.filename;
