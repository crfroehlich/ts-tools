/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable
  @typescript-eslint/explicit-function-return-type,
  @typescript-eslint/no-empty-function,
  @typescript-eslint/no-var-requires,
  func-names,
  no-console,
  global-require */
import * as path from 'path';
import * as webpack from 'webpack';
import { loadEnv } from '../src/env';
import { LogLevel, LogOutput, getLogger } from '../src/logger';

// This plugin can increase the performance of the build by caching and incrementally building
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

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

export interface BundleConfig {
  sourceDirectory: string;
  distDirectory: string;
  libraryName: string;
  bundleTarget: BundleTarget;
  mode?: BundleMode | undefined;
}

export const BundleDefaults: BundleConfig = {
  sourceDirectory: './src/index.ts',
  distDirectory: './dist',
  libraryName: 'app',
  bundleTarget: BundleTarget.NODE,
  mode: undefined,
};

export const getWebpackConfig = (config: BundleConfig = BundleDefaults): webpack.Configuration => {
  const env = loadEnv();
  let { mode } = config;
  if (mode !== BundleMode.PRODUCTION && mode !== BundleMode.DEVELOPMENT) {
    mode = BundleMode.PRODUCTION;
    if (env.NODE_ENV?.toLowerCase().startsWith('prod') !== true) {
      mode = BundleMode.DEVELOPMENT;
    }
  }
  const watch: boolean = env.HMR?.toString().toLowerCase() === 'true';
  log.info('Starting bundle', {
    processEnv: env.NODE_ENV,
    resolvedEnv: mode,
    outputPath: path.resolve(config.distDirectory),
    watch,
  });

  const filename =
    mode === BundleMode.PRODUCTION
      ? `${config.libraryName.toLowerCase().trim()}.min.js`
      : `${config.libraryName.toLowerCase().trim()}.js`;

  return {
    entry: config.sourceDirectory || './src/index.ts',
    mode,
    watch,
    output: {
      path: path.resolve(__dirname, config.distDirectory || 'dist'),
      filename,
      library: config.libraryName,
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    resolve: {
      extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
      modules: ['node_modules'],
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'awesome-typescript-loader',
            },
          ],
        },
      ],
    },
    plugins: [
      new HardSourceWebpackPlugin(),
      new TsConfigPathsPlugin({
        tsconfig: path.join(__dirname, 'tsconfig.bundle.json'),
      }),
    ],
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
