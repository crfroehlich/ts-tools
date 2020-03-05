import * as readline from 'readline'; 
import { promisify } from 'util';
import { existsSync, fstat, statSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { Readme, ReadmeBlock } from './readme';
import { relative, resolve, join, isAbsolute } from 'path';
import * as stdio from 'stdio';

/*
 * @param docs - a {@link ScriptDocs} object
 *
 * @returns a string composed of formatted {@link ScriptDocs} joined together.
 */
export const formatScriptDocs = (docs: ScriptDocs): string => {
  return Object.keys(docs)
    .map((scriptName): string => {
      const { description } = docs[scriptName];
      return `\`yarn ${scriptName}\`\n- ${description}\n`;
    })
    .join('\n');
};

const STANDARD_DOCS_PATH = 'public/en/platform/protect-tools-js';

/*
 * string field is for inserting new sections.
 * regex field is for matching sections.
 */
const HEADERS = {
  FIRST: {
    RE: /^ *#* /,
  },
  TOC: {
    STRING: '## Table of Contents',
    RE: /^ *#* *Table of Contents/
  },
  LICENSE: {
    STRING: '## License',
    RE: /^ *#* *License/,
  },
  GETTING_STARTED: {
    STRING: '## Getting Started',
    RE: /^ *#* *Getting Started/,
  },
  SCRIPTS: {
    STRING: '## `package.json` scripts',
    RE: /^ *#* *`package.json` scripts/,
  }
};

interface ScriptDoc {
  /*
   * script doc description property.
   */
  description: string;

  /*
   * flag as to whether script is for devs or not. 
   * not currently used, but potentially useful for f  uture organization.
   */
  dev: boolean;
}

export interface ScriptDocs {
  /*
   * A string to {@link ScriptDoc}-block mapping.
   */
  [index: string]: ScriptDoc;
}

function getRepoRoot():string {

  const argsDef = {
    'repo-root': {
      key: 'r',
      description: 'root path for your repository (used to find the standard documentation directory)', 
      required: true,
      multiple: true,
    },
  };

  const args = stdio.getopt(argsDef);

  if (!args || !args['repo-root'] || typeof args['repo-root'] !== 'string') {
    throw new Error('Required argument: -r, --repo-root');
  }

  return  args['repo-root'];

}


interface DocLinksParams {
  /*
   * A string representing the header line for the link block to standard documentation files.
   */
  header: string;

  /*
   * An string representing an introduction to the standard documentation links block.
   */
  introduction?: string;

  /*
   * path to the repo root for calculation of a relative path to the standard documentation directory.
   */
  repoRoot: string | null;
}
/*
 * @params {@link DocLinksParams}
 * @returns a {@link ReadmeBlock} of relative links to the documents in the standardized documentation path
 */
function buildDocumentationLinksBlock({ header = '## Getting Started', introduction = '', repoRoot = null }: DocLinksParams): ReadmeBlock {

  if (!repoRoot) {
    throw new Error('null repo root!');
  }

  const relativePath = relative(repoRoot, STANDARD_DOCS_PATH);
  const docFilepaths = readdirSync(relativePath, 'utf8')
    .map((filename) => join(relativePath, filename))
    .filter((fullpath) => fullpath.endsWith('.md') && statSync(fullpath).isFile());

  const docLinkContent = docFilepaths
    .map((filepath) => {
      let content;

      try {
        content = readFileSync(filepath, 'utf8');
      } catch (e) {
        throw new Error(`Error reading file: ${filepath}: \n${e}`);
      }

      const lines = content.split('\n');
      const firstHeader = lines.find((line) => /^ *#/.test(line)) || '';

      return {
        firstHeader: firstHeader.trim(),
        filepath,
      };
    })
    .filter((fileData) => fileData.firstHeader.length > 0)
    .map(({ filepath, firstHeader }) => {
      const titleParts = firstHeader.split(' ').slice(1);
      return `- [${titleParts.join(' ')}](${filepath})`;
    })
    .join('\n');

  const content = `${introduction}\n\n${docLinkContent}`;

  return new ReadmeBlock({ header, content });
}

function standardize(content: string, scriptDocs: ScriptDocs, repoRoot: string):string {

  const readme = new Readme(content);
  const docLinksBlock = buildDocumentationLinksBlock({
    header: HEADERS.GETTING_STARTED.STRING,
    introduction: 'To get started, take a look at the documentation listed below:\n',
    repoRoot,
  });

  // Update links to documentation
  const gettingStartedSection = readme.getSection(HEADERS.GETTING_STARTED.RE);
  if (gettingStartedSection) {
    gettingStartedSection.content = docLinksBlock.content;
  } else { 
    readme.appendBlock(docLinksBlock);
  }

    // Update script documentation 
  const scriptDocsSection = readme.getSection(HEADERS.SCRIPTS.RE);
  if (scriptDocsSection) {
    scriptDocsSection.content = formatScriptDocs(scriptDocs);
  } else {
    readme.appendBlock({
      header: HEADERS.SCRIPTS.STRING,
      content: formatScriptDocs(scriptDocs),
    });
  }

  // Update License block
  const licenseSection = readme.getSection(HEADERS.LICENSE.RE);
  if (licenseSection) {
    licenseSection.content = Readme.getLicenseBlock().content;
  } else {
    readme.appendBlock(Readme.getLicenseBlock());
  }


  // Update table of contents
  const tocSection = readme.getSection(HEADERS.TOC.RE);
  if (tocSection) {
    console.log('matched', tocSection);
    tocSection.content = readme.getTocBlock().content;
  } else {
    readme.insertAfter(/^ *#* /, readme.getTocBlock());
  }

  return readme.export();

}

async function main() {

  /*
   * Assumption: README.md and package.json are located in the ${repoRoot} directory
   */

  const repoRoot = getRepoRoot();
  const resolvedRepoRoot = isAbsolute(repoRoot) ? repoRoot : resolve(join(process.cwd(), repoRoot));
  const readmePath = join(resolvedRepoRoot, 'README.md');
  let readmeContent = '';
  try {
    readmeContent = readFileSync(readmePath, 'utf8');
  } catch(e) {
    if (e.code === 'ENOENT') {
      readmeContent = '';
    } else {
      throw new Error(e);
    }
  }
  const packageJsonContent = JSON.parse(
    readFileSync(join(resolvedRepoRoot, 'package.json'), 'utf8')
  );
  const scriptDocs = packageJsonContent.scriptsDocumentation || {};
  const readme  = new Readme(readmeContent);

  writeFileSync(readmePath, standardize(readmeContent, scriptDocs, repoRoot));

}


if (process?.mainModule?.filename === __filename) {
  main();
}
