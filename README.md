# Test README

[![Concourse-CI](https://concourse.ns8-infrastructure.com/api/v1/teams/main/pipelines/protect-js-tools/jobs/test/badge)](https://concourse.ns8-infrastructure.com/teams/main/pipelines/protect-js-tools)

Target:
We have a bunch of tools, are they server-side and client-side? If they are both, should we dedicate a dir for each, with a separate package.json, tsconfig.json, linting etc?

Exports (aka Barrel files):
- Not very happy with cti tool.  ovewrites files w/ out checking, not amazingly maintained, better alternatives (barrelsby). We want to be able to tree-shake so that a consumer only gets only the tools they require.  
- 'import *' pattern.  Will this be a problem w/ tree shaking?

