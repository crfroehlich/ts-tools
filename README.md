# @ns8/protect-tools-js

## Table of Contents

- [Getting Started](#getting-started)
- [`package.json` scripts](#packagejson-scripts)
- [Environment Variables](#environment-variables)
- [License](#license)

## Getting Started

To get started, take a look at the documentation listed below:

- docs
  - [Project Bundling](docs/bundling.md)
  - [Documentation Tooling](docs/documentation.md)
  - [Environment Variables](docs/environment-variables.md)
  - [Logging Client](docs/logger.md)
  - [API Report File for "@ns8/protect-tools-js"](docs/project-api.md)
  - [Readme Tool](docs/readme.md)

## `package.json` scripts

- `yarn beautify`: Performs aesthetic operations to make the project files easier to navigate and read.
- `yarn build`: Assembles build scripts into a single js module with type definitions.
- `yarn build:prod`: Assembles the project for production.
- `yarn build:watch`: Builds and tests concurrently while you develop.
- `yarn clean`: Purges all temporary folders.
- `yarn count`: Counts lines of source code.
- `yarn docs:all`: Runs all documentation commands.
- `yarn docs:api`: Generates a single API doc based on the code in the project.
- `yarn docs:publish`: Assembles the Markdown documentation for the entire project and publish it to GitHub pages using API Extractor.
- `yarn docs:standardize`: Creates or updates a new readme with a standard set of readme sections, including a toc, yarn script documentation, links to repo documentation files and an NS8 license.
- `yarn generate:exports`: Generates index.ts files for all exports recursively in the 'src' folder.
- `yarn lint`: Lints the codebase.
- `yarn lint:docs`: Lints the code documentation.
- `yarn lint:fix`: Lints the codebase and automatically fixes what it can.
- `yarn test`: Runs tests and calculates test coverage.
- `yarn test:fast`: Runs tests in parallel and calculates test coverage.
- `yarn test:watch`: Re-runs tests as you develop.

## Environment Variables

- `DOCS_CREATE_README_INDEX`: Please document the <DOCS_CREATE_README_INDEX> variable
  - Default Value: "undefined"
- `DOCS_CREATE_TOC`: Please document the <DOCS_CREATE_TOC> variable
  - Default Value: "undefined"
- `NODE_ENV`: Please document the <NODE_ENV> variable
  - Default Value: "undefined"
- `SYNC_PEER_DEPENDENCIES`: Please document the <SYNC_PEER_DEPENDENCIES> variable
  - Default Value: "undefined"

## License

See [License](./LICENSE)

© [ns8inc](https://ns8.com)
