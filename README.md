# Test README

[![Concourse-CI](https://concourse.ns8-infrastructure.com/api/v1/teams/main/pipelines/protect-tools-js/jobs/test/badge)](https://concourse.ns8-infrastructure.com/teams/main/pipelines/protect-tools-js)

### `package.json` scripts

`yarn beautify`
- Perform aesthetic operations to make the project files easier to navigate and read.

`yarn build`
- assembles build scripts into a single js module with type definitions.

`yarn docs:sync-build-scripts`
- generates a readme build scripts section like this one using the scriptsDocumentation property, if present, in the package.json file.

`yarn lint`
- Lints the codebase.

`yarn test`
- Runs tests and calculates test coverage.
