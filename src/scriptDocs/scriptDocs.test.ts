import { expect } from 'chai';
import 'mocha';

import { ScriptsDocs, formatScriptDocs } from './scriptDocs';

/*
 * Test Cases:
 *
 * - readme has no build script information at all
 * - readme has build script info as the last section
 * - readme has build script info as a middle section
 */

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

describe('formatScriptDocs', () => {
  it('maps an object of keys mapped to a an object with a description property into a markdown line', () => {
    const formatted = formatScriptDocs(parsedPackageJson.scriptsDocumentation as ScriptsDocs);
    expect(formatted).to.equal(
      [
        '`yarn script1`\n- script 1 description\n',
        '`yarn script2`\n- script 2 description\n',
        '`yarn script3`\n- script 3 description\n',
        '`yarn script4`\n- script 4 description\n',
      ].join('\n'),
    );
  });
});
