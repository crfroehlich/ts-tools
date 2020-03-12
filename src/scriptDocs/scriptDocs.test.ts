import { expect } from 'chai';
import 'mocha';

import { formatScriptDocs, updateScriptDocs } from './scriptDocs';

const NO_SCRIPT_DOCS = `
# Test Readme

## Description
This is a readme for testing scriptDocumentation.

## Contributoring
Please submit a PR using the PR template.
`;

const EXISTING_SCRIPT_DOCS = `
# Test Readme

## Description
This is a readme for testing scriptDocumentation.

## Contributoring
Please submit a PR using the PR template.

### \`package.json\` scripts

\`yarn test\`
- Run tests

\`yarn lint\`
- Lint your code
`;

const TEST_READMES = {
  NO_SCRIPT_DOCS,
  EXISTING_SCRIPT_DOCS,
};

const SCRIPT_DOCS_HEADER = '### `package.json` scripts';

const expectedScriptDocs = [
  '`yarn lint`\n- lints code\n',
  '`yarn build`\n- builds for dist\n',
  '`yarn deploy`\n- deploys to an s3 bucket\n',
  '`yarn test`\n- runs tests\n',
].join('\n');

const parsedPackageJson = {
  scripts: {
    lint: 'yarn lint',
    build: 'yarn build',
    deploy: 'yarn deploy',
    test: 'yarn test',
  },
  scriptsDocumentation: {
    lint: {
      dev: true,
      description: 'lints code',
    },
    build: {
      dev: true,
      description: 'builds for dist',
    },
    deploy: {
      dev: true,
      description: 'deploys to an s3 bucket',
    },
    test: {
      dev: true,
      description: 'runs tests',
    },
  },
};

describe('formatScriptDocs', () => {
  it('maps a package.json ScriptDocs object to a markdown block of documentation on script docs.', () => {
    const formatted = formatScriptDocs(parsedPackageJson.scriptsDocumentation);
    expect(formatted).to.equal(expectedScriptDocs);
  });
});

describe('update script docs in readme without script docs', () => {
  const updatedReadme = updateScriptDocs(parsedPackageJson.scriptsDocumentation, TEST_READMES.NO_SCRIPT_DOCS);

  const expectedReadme = `${TEST_READMES.NO_SCRIPT_DOCS}\n${SCRIPT_DOCS_HEADER}\n${expectedScriptDocs}\n`;

  expect(updatedReadme).to.equal(expectedReadme);
});

describe('update script docs in readme without an existing script docs section', () => {
  const updatedReadme = updateScriptDocs(parsedPackageJson.scriptsDocumentation, TEST_READMES.EXISTING_SCRIPT_DOCS);

  expect(updatedReadme).to.include(expectedScriptDocs);
  expect(updatedReadme).to.include(SCRIPT_DOCS_HEADER);
});
