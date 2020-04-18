/**
 * @public
 */
export type globCallback = (err: Error | null, matches: string[]) => void;

/**
 * @public
 */
export interface GlobOptions {
  dot?: boolean;
  ignore?: string[];
  realPath?: boolean;
}

/**
 * @public
 */
export const GLOB_OPTIONS = {
  dot: true,
  ignore: [
    '.circleci/**',
    '.vscode/**',
    'coverage/**',
    'dist/**',
    'node_modules/**',
    'nyc_output/**',
    'tsconfig.json',
    '**/test-data/**',
  ],
  realPath: true,
};
