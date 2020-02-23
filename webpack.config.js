/* eslint-disable
  @typescript-eslint/explicit-function-return-type,
  @typescript-eslint/no-empty-function,
  @typescript-eslint/no-var-requires,
  func-names,
  no-console,
  global-require */
const path = require('path');
// This plugin can increase the performance of the build by caching and incrementally building
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

require('dotenv-extended').load();

let mode = 'production';
if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase().startsWith('prod') !== true) {
  mode = 'development';
}
console.log(`Compiling in ${process.env.NODE_ENV}:${mode} mode`);

const config = {
  entry: './src/index.ts',
  mode,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: mode === 'production' ? 'protect-js-tools.min.js' : 'protect-js-tools.js',
    library: 'Protect',
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
  target: 'node',
  node: {
    fs: 'empty',
    __dirname: false,
    __filename: false,
  },
};

module.exports = config;
