# Project Bundling

Bundling is a mechanism to convert all of the individual source files representing your project's code into a single, distributable file which can be loaded by external consumers (either the browser or as node dependencies). Key features of bundling include:

- Minification of production builds
- Tree shaking to remove unused code
- Dependency injection--bundled code includes all dependencies automatically (no need for bundling vendor deps)
- Source mapping
- TypeScript definitions for bundled code
- Live reloading of bundle as code changes

## Table of Contents

- [Project Bundling](#project-bundling)
  - [Usage](#usage)
  - [Hot Module Reloading](#hot-module-reloading)

## Usage

Webpack is the tool that powers the bundling. By using protect-tools-js, you no longer need to manually configure all of the complexity around configuring bundling and managing dependencies. This project allows you to simplify your webpack configuration.

- First, import these projects: `yarn add dev @ns8/protect-tools-js webpack-cli`
- Second, create a `webpack.config.ts` file in the root of your project with the following example:

```ts
import { BundleTarget, getWebpackConfig } from '@ns8/protect-tools-js';
export default getWebpackConfig({
  bundleTarget: BundleTarget.NODE,
  distDirectory: './dist',
  sourceDirectory: './src/index.ts',
  libraryName: 'index',
});
```

The following configuration options are possible:

- `bundleTarget` supports `NODE` or `WEB`
- `bundleMode` (optional param) supports `PRODUCTION` or `DEVELOPMENT`. If omitted, the mode defers to the environment variable `NODE_ENV`. If no value is supplied, the mode defaults to `PRODUCTION`
- `distDirectory` is the output path for the bundle
- `sourceDirectory` is the input path for the source code to be compiled and bundled
- `libraryName` is the name that will be used both for the name of the library as well as the names of the output files
- `hmr` explicitly turn Hot Module Reloading (web) or watch (node) on
- `useTypeCheckingService` optionally enable the type checking service (this can sometimes decrease build performance)

## Hot Module Reloading

If the environment variable `HMR` is set to true, webpack will automatically recompile and lint your code as you make changes. Additionally, if the `bundleTarget` is set to `WEB`, webpack will auto-refresh your browser as builds complete.
