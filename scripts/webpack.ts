import * as path from 'path';
import * as webpack from 'webpack';
import { readFileSync } from 'fs';
import { loadEnv } from '../src/env';
import { LogLevel, LogOutput, getLogger } from '../src/logger';

// This plugin can increase the performance of the build by caching and incrementally building
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpackFailPlugin = require('webpack-fail-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const PnpWebpackPlugin = require('pnp-webpack-plugin');

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

const log = getLogger({
  logLevel: LogLevel.DEBUG,
  serviceName: 'webpack',
  transports: [LogOutput.CONSOLE, LogOutput.FILE],
});

export enum BundleMode {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}

export enum BundleTarget {
  NODE = 'node',
  WEB = 'web',
}

export enum BundleDevTool {
  INLINE = 'inline-source-map',
  OUTLINE = 'source-map',
}

export interface BundleConfig {
  sourceDirectory: string;
  distDirectory: string;
  libraryName: string;
  bundleTarget: BundleTarget;
  mode?: BundleMode | undefined;
}

export const BundleDefaults: BundleConfig = {
  sourceDirectory: './src/index.ts',
  distDirectory: '../dist',
  libraryName: 'app',
  bundleTarget: BundleTarget.NODE,
  mode: undefined,
};

export const getWebpackConfig = (config: BundleConfig = BundleDefaults): webpack.Configuration => {
  const env = loadEnv();
  let { mode } = config;
  if (!mode || (mode !== BundleMode.PRODUCTION && mode !== BundleMode.DEVELOPMENT)) {
    mode = BundleMode.PRODUCTION;
    if (env.NODE_ENV?.toLowerCase().startsWith('prod') !== true) {
      mode = BundleMode.DEVELOPMENT;
    }
  }

  const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
  const banner = `
    ${pkg.name}: ${pkg.version}
    ${license}
  `;

  const plugins: webpack.Plugin[] = [
    new HardSourceWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      eslint: true,
    }),
    new ForkTsCheckerNotifierWebpackPlugin({ title: 'TypeScript', excludeWarnings: false }),
    new webpack.BannerPlugin({
      banner,
    }),
  ];
  if (mode === BundleMode.PRODUCTION) {
    plugins.push(webpackFailPlugin);
  } else {
    plugins.push(new WebpackNotifierPlugin({ title: 'Webpack build', excludeWarnings: true }));
    if (config.bundleTarget === BundleTarget.WEB) {
      plugins.push(new webpack.HotModuleReplacementPlugin());
    }
    plugins.push(new webpack.SourceMapDevToolPlugin());
  }

  const watch: boolean = mode !== BundleMode.PRODUCTION && env.HMR?.toString().toLowerCase() === 'true';

  const filename =
    mode === BundleMode.PRODUCTION
      ? `${config.libraryName.toLowerCase().trim()}.min.js`
      : `${config.libraryName.toLowerCase().trim()}.js`;

  const entry = config.sourceDirectory || './src/index.ts';

  const outputPath = path.resolve(__dirname, config.distDirectory || '../dist');

  log.info('Starting bundle', {
    processEnv: env.NODE_ENV,
    resolvedEnv: mode,
    watch,
    filename,
    entry,
    outputPath,
    target: config.bundleTarget,
  });

  return {
    entry,
    mode,
    watch,
    output: {
      path: outputPath,
      filename,
      library: config.libraryName,
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    resolve: {
      extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
      modules: ['node_modules'],
      plugins: [PnpWebpackPlugin],
    },
    resolveLoader: {
      plugins: [PnpWebpackPlugin.moduleLoader(module)],
    },
    devtool: BundleDevTool.OUTLINE,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
        },
      ],
    },
    plugins,
    target: config.bundleTarget,
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
