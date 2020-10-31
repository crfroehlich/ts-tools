/* eslint-disable
  @typescript-eslint/no-explicit-any,
  complexity,
  no-shadow,
  sonarjs/cognitive-complexity,
*/
import path from 'path';
import fs from 'fs';
import { BannerPlugin, Configuration, DefinePlugin, HotModuleReplacementPlugin, SourceMapDevToolPlugin } from 'webpack';
import { LogLevel, getCliLogger } from '../logger/logger';

const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpackFailPlugin = require('webpack-fail-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const tsLoader = require('ts-loader');

/**
 * Bundles for development or production
 * @remarks production implies minification
 * @public
 */
export enum BundleMode {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

/**
 * Target for bundle, either node or web
 * @public
 */
export enum BundleTarget {
  NODE = 'node',
  WEB = 'web',
}

/**
 * Optional globals that need to be injected into the bundle
 * @public
 */
export interface BundleGlobals {
  name: string;
  value: boolean | string;
}

/**
 * Method for bundling.
 * {@link https://webpack.js.org/configuration/devtool/}
 * @public
 */
export enum BundleDevTool {
  CHEAP_MODULE_SOURCE_MAP = 'cheap-module-source-map',
  CHEAP_SOURCE_MAP = 'cheap-source-map',
  EVAL = 'eval',
  EVAL_CHEAP_MODULE_SOURCE_MAP = 'eval-cheap-module-source-map',
  EVAL_CHEAP_SOURCE_MAP = 'eval-cheap-source-map',
  EVAL_SOURCE_MAP = 'eval-source-map',
  FILE = 'source-map',
  HIDDEN_SOURCE_MAP = 'hidden-source-map',
  INLINE = 'inline-source-map',
  INLINE_CHEAP_MODULE_SOURCE_MAP = 'inline-cheap-module-source-map',
  INLINE_CHEAP_SOURCE_MAP = 'inline-cheap-source-map',
  INLINE_SOURCE_MAP = 'inline-source-map',
  NO_SOURCES_SOURCE_MAP = 'nosources-source-map',
  SOURCE_MAP = 'source-map',
}

/**
 * Standard configuration options for bundle generation
 * @public
 */
export interface BundleConfig {
  bundleTarget: BundleTarget;
  devtool: BundleDevTool;
  distDirectory: string;
  fileName?: string;
  globals?: BundleGlobals[];
  hmr?: boolean;
  libraryName: string;
  logLevel?: LogLevel;
  mode?: BundleMode;
  sourceDirectory: string;
  useTypeCheckingService?: boolean;
}

/**
 * Default values for bundle configuration
 * @public
 */
export const BundleDefaults: BundleConfig = {
  bundleTarget: BundleTarget.NODE,
  devtool: BundleDevTool.EVAL,
  distDirectory: '../dist',
  hmr: undefined,
  libraryName: 'index',
  logLevel: LogLevel.ERROR,
  mode: BundleMode.DEVELOPMENT,
  sourceDirectory: './src/index.ts',
  useTypeCheckingService: false,
};

/**
 * Executes the bundler
 * @public
 * @param config - bundle configuration
 */
export const getWebpackConfig = (config: BundleConfig = BundleDefaults): Configuration => {
  if (!tsLoader) {
    throw new Error('Loaders missing');
  }
  const log = getCliLogger('js-tools/bundle');

  const license = `
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>
`;

  let { mode, devtool } = config;
  const {
    bundleTarget,
    distDirectory,
    fileName,
    globals,
    hmr,
    libraryName,
    logLevel,
    sourceDirectory,
    useTypeCheckingService,
  } = config;
  if (!mode || (mode !== BundleMode.PRODUCTION && mode !== BundleMode.DEVELOPMENT)) {
    mode = BundleMode.PRODUCTION;
    if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase().startsWith('prod') !== true) {
      mode = BundleMode.DEVELOPMENT;
    }
  }
  if (mode === BundleMode.PRODUCTION) {
    devtool = BundleDevTool.CHEAP_SOURCE_MAP;
  }
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
  const banner = `
    ${pkg.name}: ${pkg.version}
    ${license}
  `;

  const plugins: any[] = [
    new BannerPlugin({
      banner,
    }),
  ];
  if (globals) {
    globals.forEach((global) => {
      const globalObj: any = {};
      globalObj[`global.${global.name}`] = global.value;
      plugins.push(new DefinePlugin(globalObj));
    });
  }
  if (useTypeCheckingService) {
    plugins.push(
      new ForkTsCheckerWebpackPlugin({
        eslint: true,
      }),
    );
    plugins.push(
      new ForkTsCheckerNotifierWebpackPlugin({
        title: 'TypeScript',
        excludeWarnings: false,
      }),
    );
  }
  const watch: boolean =
    hmr || (mode !== BundleMode.PRODUCTION && process.env.HMR?.toString().toLowerCase() === 'true');

  if (mode === BundleMode.PRODUCTION) {
    plugins.push(webpackFailPlugin);
  } else {
    plugins.push(
      new WebpackNotifierPlugin({
        title: 'Webpack build',
        excludeWarnings: false,
      }),
    );
    if (watch && bundleTarget === BundleTarget.WEB) {
      plugins.push(new HotModuleReplacementPlugin());
    }
    plugins.push(new SourceMapDevToolPlugin());
  }

  let filename = fileName;
  if (!filename) {
    filename =
      mode === BundleMode.PRODUCTION
        ? `${libraryName.toLowerCase().trim()}.min.js`
        : `${libraryName.toLowerCase().trim()}.js`;
  }

  const warnings: boolean = logLevel !== undefined && logLevel !== LogLevel.ERROR;

  const entry = sourceDirectory || './src/index.ts';
  const outputPath = path.resolve(distDirectory || './dist');
  log.info('Starting bundle', {
    devtool,
    entry,
    filename,
    logLevel,
    outputPath,
    processEnv: process.env.NODE_ENV,
    resolvedEnv: mode,
    target: bundleTarget,
    watch,
  });

  // Regular expression to find scripts with a `#!/usr/bin/env node` shebang.
  // This facilitates removing the shebang to avoid webpack build errors.
  const distDir = '/node_modules/ts-tools/dist';
  const subDirs = '(docs|readme|lint)';
  const scripts = '(generateApiDocs|generateApi|standardizeReadme|sortJson)';
  const distScripts = new RegExp(`${distDir}/${subDirs}/${scripts}.js`);

  return {
    entry,
    mode,
    watch,
    output: {
      path: outputPath,
      filename,
      library: libraryName,
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    resolve: {
      extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
      modules: ['node_modules'],
    },
    devtool,
    externals: {
      // The fsevents package includes a binary file via require(), which
      // causes a build error when webpack attempts to parse it. Using
      // externals allows us to use the webpack-equivalent require().
      fsevents: 'require("fsevents")',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: distScripts,
          use: [
            {
              loader: 'string-replace-loader',
              options: {
                search: '#!/usr/bin/env node',
                replace: '',
              },
            },
          ],
        },
      ],
    },
    plugins,
    target: bundleTarget,
    node: {
      __dirname: false,
      __filename: false,
    },
    stats: {
      warnings,
    },
    watchOptions: {
      ignored: ['**/*.js', 'node_modules/**'],
    },
  };
};
