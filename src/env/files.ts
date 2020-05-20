/**
 * Callback representation for glob callback
 * @public
 */
export type globCallback = (err: Error | null, matches: string[]) => void;

/**
 * Structure reprsenting glob options
 * @public
 */
export interface GlobOptions {
  dot?: boolean;
  ignore?: string[];
  realPath?: boolean;
}

/**
 * Options for glob input
 * @public
 */
export const GLOB_OPTIONS: GlobOptions = {
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
