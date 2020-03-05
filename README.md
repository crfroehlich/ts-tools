# Test README

[![Concourse-CI](https://concourse.ns8-infrastructure.com/api/v1/teams/main/pipelines/protect-tools-js/jobs/test/badge)](https://concourse.ns8-infrastructure.com/teams/main/pipelines/protect-tools-js)

## Table of Contents

+ [Table of Contents](#table-of-contents)
  + [Getting Started](#getting-started)
  + [`package.json` scripts](#packagejson-scripts)
  + [License](#license)

## Getting Started

To get started, take a look at the documentation listed below:


- [Getting Started](public/en/platform/protect-tools-js/getting-started.md)
- [Logging Client](public/en/platform/protect-tools-js/logger.md)
- [Readme Tool](public/en/platform/protect-tools-js/readme.md)

## `package.json` scripts

`yarn beautify`
- Perform aesthetic operations to make the project files easier to navigate and read.

`yarn build`
- assembles build scripts into a single js module with type definitions.

`yarn clean`
- Purges all temporary folders.

`yarn docs:sync-build-scripts`
- generates a readme build scripts section using the scriptsDocumentation property, if present, in the package.json file

`yarn docs:sync-readme`
- creates or updates a new readme with a toc, script docs, links to docs and a license

`yarn generate:exports`
- Generates index.ts files for all exports recursively in the 'src' folder

`yarn lint`
- Lints the codebase.

`yarn lint:fix`
- Lints the codebase and automatically fixes what it can.

`yarn test`
- Runs tests and calculates test coverage.

## License

NS8 PROPRIETARY 1.0