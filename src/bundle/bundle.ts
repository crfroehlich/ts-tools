/* eslint-disable
  @typescript-eslint/no-explicit-any,
  complexity,
  sonarjs/cognitive-complexity,
*/
import path from 'path';
import fs from 'fs';
import * as webpack from 'webpack';
import { getLogger } from '../logger/logger';

const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
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
  bundleMode: webpack.Options.Devtool;
  bundleTarget: BundleTarget;
  distDirectory: string;
  fileName?: string;
  globals?: BundleGlobals[];
  hmr?: boolean;
  libraryName: string;
  mode?: BundleMode;
  sourceDirectory: string;
  useTypeCheckingService?: boolean;
}

/**
 * Default values for bundle configuration
 * @public
 */
export const BundleDefaults: BundleConfig = {
  bundleMode: BundleDevTool.EVAL,
  bundleTarget: BundleTarget.NODE,
  distDirectory: '../dist',
  hmr: undefined,
  libraryName: 'index',
  mode: BundleMode.DEVELOPMENT,
  sourceDirectory: './src/index.ts',
  useTypeCheckingService: false,
};

/**
 * Executes the bundler
 * @public
 * @param config - bundle configuration
 */
export const getWebpackConfig = (config: BundleConfig = BundleDefaults): webpack.Configuration => {
  if (!tsLoader) {
    throw new Error('Loaders missing');
  }
  const log = getLogger();

  const license = `
-------------------------- NS8 PROPRIETARY 1.0 --------------------------

Copyright (c) 2020 NS8 Inc - All rights reserved

Proprietary and confidential.

All information contained herein is, and remains the property
of NS8 Inc. The intellectual and technical concepts contained herein
are proprietary to NS8 Inc and may be covered by U.S. and Foreign
Patents, patents in process, and are protected by trade secret or
copyright law.  Dissemination of this information or reproduction of
this material is strictly forbidden unless prior written permission is
obtained from NS8 Inc.  Access to the source code contained herein is
hereby forbidden to anyone except current NS8 Inc employees, managers
or contractors who have executed Confidentiality and Non-disclosure
agreements explicitly covering such access.

Unauthorized copy of this file, via any medium is strictly prohibited.
`;

  let { mode, bundleMode } = config;
  const {
    bundleTarget,
    distDirectory,
    fileName,
    globals,
    hmr,
    libraryName,
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
    bundleMode = BundleDevTool.CHEAP_SOURCE_MAP;
  }
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
  const banner = `
    ${pkg.name}: ${pkg.version}
    ${license}
  `;

  const plugins: webpack.Plugin[] = [
    new HardSourceWebpackPlugin(),
    new webpack.BannerPlugin({
      banner,
    }),
  ];
  if (globals) {
    globals.forEach((global) => {
      const globalObj: any = {};
      globalObj[`global.${global.name}`] = global.value;
      plugins.push(new webpack.DefinePlugin(globalObj));
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
      plugins.push(new webpack.HotModuleReplacementPlugin());
    }
    plugins.push(new webpack.SourceMapDevToolPlugin());
  }

  let filename = fileName;
  if (!filename) {
    filename =
      mode === BundleMode.PRODUCTION
        ? `${libraryName.toLowerCase().trim()}.min.js`
        : `${libraryName.toLowerCase().trim()}.js`;
  }

  const entry = sourceDirectory || './src/index.ts';
  const outputPath = path.resolve(distDirectory || './dist');
  log.info('Starting bundle', {
    bundleMode,
    entry,
    filename,
    outputPath,
    processEnv: process.env.NODE_ENV,
    resolvedEnv: mode,
    target: bundleTarget,
    watch,
  });

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
    devtool: bundleMode,
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
      ],
    },
    plugins,
    target: bundleTarget,
    node: {
      fs: 'empty',
      __dirname: false,
      __filename: false,
    },
    watchOptions: {
      ignored: ['**/*.js', 'node_modules/**'],
    },
  };
};
