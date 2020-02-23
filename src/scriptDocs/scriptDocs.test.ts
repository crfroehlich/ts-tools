import { expect } from 'chai';
import 'mocha';

import { formatScriptsDocumentation, updateReadme } from './scriptDocs';

const removeBlankLines = (content: string): string => {
  return content
    .split('\n')
    .filter(Boolean)
    .join('\n');
};

/*
 * Test Cases:
 *
 * - readme has no build script information at all
 * - readme has build script info as the last section
 * - readme has build script info as a middle section
 */

// pre-existing build script info, at the end
const README_SCRIPT_AT_END_DOCS_ACTUAL = `
# Test README
This is a test readme.
# Getting Started
Clone the repo and run yarn install
### \`package.json\` scripts
\`yarn old-script1\`
- old-script1 description
\`yarn old-script2\`
- old-script2 description
\`yarn old-script3\`
- old-script3 description
\`yarn old-script4\`
- old-script4 description
`;

const README_SCRIPT_AT_END_DOCS_EXPECTED = `
# Test README
This is a test readme.
# Getting Started
Clone the repo and run yarn install
### \`package.json\` scripts
\`yarn script1\`
- script 1 description
\`yarn script2\`
- script 2 description
\`yarn script3\`
- script 3 description
\`yarn script4\`
- script 4 description
`;

// pre-existing build script info, at the end
const README_SCRIPT_IN_MIDDLE_DOCS_ACTUAL = `
# Test README
This is a test readme.
# Getting Started
Clone the repo and run yarn install
### \`package.json\` scripts
\`yarn outdated-script1\`
- outdated-script1 description
\`yarn outdated-script2\`
- outdated-script2 description
\`yarn outdated-script3\`
- outdated-script3 description
\`yarn outdated-script4\`
- outdated-script4 description
### extra section
this is an extra section
`;

const README_SCRIPT_IN_MIDDLE_DOCS_EXPECTED = `
# Test README
This is a test readme.
# Getting Started
Clone the repo and run yarn install
### \`package.json\` scripts
\`yarn script1\`
- script 1 description
\`yarn script2\`
- script 2 description
\`yarn script3\`
- script 3 description
\`yarn script4\`
- script 4 description
### extra section
this is an extra section
`;

const parsedPackageJson = {
  scripts: {
    script1: 'test',
    script2: 'test',
    script3: 'test',
    script4: 'test',
  },
  scriptsDocumentation: {
    script1: {
      dev: true,
      description: 'script 1 description',
    },
    script2: {
      dev: true,
      description: 'script 2 description',
    },
    script3: {
      dev: true,
      description: 'script 3 description',
    },
    script4: {
      dev: true,
      description: 'script 4 description',
    },
  },
};

const { scriptsDocumentation: docs } = parsedPackageJson;
const updates = formatScriptsDocumentation(docs);

describe('SYNC-BUILD-SCRIPTS-WITH-README: script updates README.md', () => {
  it('concatenates build script info to the end of readme when there is no build script section.', () => {
    const README_NO_SCRIPT_DOCS_ACTUAL = `
# Test README
This is a test readme.
# Getting Started
Clone the repo and run yarn install
`;

    const README_NO_SCRIPT_DOCS_EXPECTED = `
# Test README
This is a test readme.
# Getting Started
Clone the repo and run yarn install
### \`package.json\` scripts
\`yarn script1\`
- script 1 description
\`yarn script2\`
- script 2 description
\`yarn script3\`
- script 3 description
\`yarn script4\`
- script 4 description
`;
    const expected = removeBlankLines(README_NO_SCRIPT_DOCS_EXPECTED);
    const actual = removeBlankLines(
      updateReadme({
        readme: README_NO_SCRIPT_DOCS_ACTUAL,
        updates,
        targetHeader: '### `package.json` scripts',
      }),
    );

    expect(actual).to.equal(expected);
  });

  it('replaces build scripts that exist at the end of the document', () => {
    const expected = removeBlankLines(README_SCRIPT_AT_END_DOCS_EXPECTED);
    const actual = removeBlankLines(
      updateReadme({
        readme: README_SCRIPT_AT_END_DOCS_ACTUAL,
        updates,
        targetHeader: '### `package.json` scripts',
      }),
    );

    expect(actual).to.equal(expected);
  });

  it('simply adds build scripts info to the readme when there is no build script section.', () => {
    const expected = removeBlankLines(README_SCRIPT_IN_MIDDLE_DOCS_EXPECTED);
    const actual = removeBlankLines(
      updateReadme({
        readme: README_SCRIPT_IN_MIDDLE_DOCS_ACTUAL,
        updates,
        targetHeader: '### `package.json` scripts',
      }),
    );

    expect(actual).to.equal(expected);
  });
});
