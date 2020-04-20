# General Purpose Build Tools for Protect Projects

[![CircleCI](https://circleci.com/gh/ns8inc/protect-tools-js.svg?style=svg&circle-token=6b0a7fe464a53289ee8ddea14f3a84b1996b5619)](https://app.circleci.com/pipelines/github/ns8inc/protect-tools-js)

## Table of Contents

- [General Purpose Build Tools for Protect Projects](#general-purpose-build-tools-for-protect-projects)
  - [Getting Started](#getting-started)
  - [Environment Variables](#environment-variables)
  - [`package.json` scripts](#packagejson-scripts)
  - [License](#license)

## Getting Started

To get started, take a look at the documentation listed below:

- docs
  - [Documentation Tooling](docs/documentation.md)
  - [Logging Client](docs/logger.md)
  - [API Report File for "@ns8/protect-tools-js"](docs/project-api.md)
  - [Readme Tool](docs/readme.md)

## Environment Variables

- `NODE_ENV`: The runtime environment, either `prod` or `dev`.

## `package.json` scripts

- `yarn beautify`: Performs aesthetic operations to make the project files easier to navigate and read.
- `yarn build`: Assembles build scripts into a single js module with type definitions.
- `yarn build:watch`: Builds and tests concurrently while you develop.
- `yarn clean`: Purges all temporary folders.
- `yarn count`: Counts lines of source code.
- `yarn docs:all`: Runs all documentation commands.
- `yarn docs:api`: Generates a single API doc based on the code in the project.
- `yarn docs:api:markdown`: Creates markdown documentation for the project and publishes to GitHub Pages.
- `yarn docs:standardize`: Creates or updates a new readme with a standard set of readme sections, including a toc, yarn script documentation, links to repo documentation files and an NS8 license.
- `yarn generate:exports`: Generates index.ts files for all exports recursively in the 'src' folder.
- `yarn lint`: Lints the codebase.
- `yarn lint:docs`: Lints the code documentation.
- `yarn lint:fix`: Lints the codebase and automatically fixes what it can.
- `yarn test`: Runs tests and calculates test coverage.
- `yarn test:fast`: Runs tests in parallel and calculates test coverage.
- `yarn test:watch`: Re-runs tests as you develop.

## License

See [License](./LICENSE)
© [ns8inc](https://ns8.com)
