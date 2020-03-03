import { expect } from 'chai';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import 'mocha';

import { formatScriptDocs, updateReadme } from './scriptDocs';

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

describe('updateReadme', () => {

  it('should throw if given an invalid path', async () => {

    const invalidPath = '';

    try { 
      await updateReadme({ path: invalidPath, content: '', target: '' });
    } catch(e) {
      expect(e.message).to.equal(`Error: invalid path: ${invalidPath}`);
    }

  });

  it('should append a new section if the target doesnt match any target in the file', async () => {

    const docPath = join(__dirname, 'test-data', 'docs.md');
    const testFile = readFileSync(docPath, 'utf8');
    const updated = await updateReadme({
      path: docPath,
      content: 'new content',
      target: '### New Section'
    });

    expect(updated.trim()).to.equal(testFile + '\n### New Section\nnew content');

  });

  it('should replace an existing section if the target matches any target in the file', async () => {

    const docPath = join(__dirname, 'test-data', 'docs.md');
    const testFile = readFileSync(docPath, 'utf8');
    const updated = await updateReadme({
      path: docPath,
      content: 'new content',
      target: '### `package.json` scripts',
    });

    expect(updated.trim()).to.equal(testFile + '\n### New Section\nnew content');

  });


});
