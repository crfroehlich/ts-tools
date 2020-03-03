import { expect } from 'chai';
import 'mocha';

import { formatScriptDocs } from './scriptDocs';

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
    const expected = [
      `\`yarn lint\`\n- lints code\n`,
      `\`yarn build\`\n- builds for dist\n`,
      `\`yarn deploy\`\n- deploys to an s3 bucket\n`,
      `\`yarn test\`\n- runs tests\n`,
    ].join('\n');

    expect(formatted).to.equal(expected);

  });
});
