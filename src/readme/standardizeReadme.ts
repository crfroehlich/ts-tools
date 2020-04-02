import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { isAbsolute, join, relative, resolve } from 'path';
import * as stdio from 'stdio';
import { Readme, ReadmeBlock } from './readme';
import { DocLinksParams, ScriptDocs } from './types';

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
    RE: /^ *#* *Table of Contents/,
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
  },
};

const STANDARD_DOCS_PATH = 'docs';

/*
 * @param docs - a {@link ScriptDocs} object containing documentation objects describing
 * package.json scripts.
 *
 * @returns a {@link ReadmeBlock} whose content is a formatted {@link ScriptDocs}.
 */
const formatScriptDocs = (docs: ScriptDocs): ReadmeBlock => {
  const header = HEADERS.SCRIPTS.STRING;
  const content = Object.keys(docs)
    .map((scriptName): string => {
      const { description } = docs[scriptName];
      return `\`yarn ${scriptName}\`\n\n- ${description}\n`;
    })
    .join('\n');

  return new ReadmeBlock({
    header,
    content,
  });
};

/*
 * @returns a string path to the repository root, which is used in building links to documentation
 * and referencing the standard package.json and README.md locations.
 */

function getRepoRoot(): string {
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

  return args['repo-root'];
}

/*
 * @params {@link DocLinksParams} - a doc links section header, an introductory paragraph, and a path to the repository.
 * @returns a {@link ReadmeBlock} of relative links to the documents in the standardized documentation path
 */
function buildDocumentationLinksBlock({
  header = '## Getting Started',
  introduction = '',
  repoRoot = null,
}: DocLinksParams): ReadmeBlock {
  if (!repoRoot) {
    throw new Error('null repo root!');
  }

  const relativePath = relative(repoRoot, STANDARD_DOCS_PATH);
  const docFilepaths = readdirSync(relativePath, 'utf8')
    .map((filename) => join(relativePath, filename))
    .filter((fullpath) => fullpath.endsWith('.md') && statSync(fullpath).isFile());

  const docLinksContent = docFilepaths
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

  const content = `${introduction ? `${introduction}\n` : ''}${docLinksContent}`;

  return new ReadmeBlock({ header, content });
}

/*
 * @param content - readme text content.
 * @param scriptDocs - a {@link ScriptDocs} object containing documentation on package.json scripts.
 * @ param repoName - the name of the repository, used as a fallback for the top-level readme header if it's missing.
 *
 * @returns an exported {@link Readme} instance.
 */

function standardize(content: string, scriptDocs: ScriptDocs, repoRoot: string, repoName: string): string {
  /*
   * Check for the presence of standard sections.
   * If they exist, update them. If not, append them.
   * Order of appends should be:
   *   main repo header
   *   links to standard docs / 'Getting Started'
   *   yarn script documentation
   *   license
   *   table of contents
   */

  const readme = new Readme(content);
  let mainHeader = readme.getSection(/^ *# /);
  const tocSection = readme.getSection(HEADERS.TOC.RE);
  const gettingStartedSection = readme.getSection(HEADERS.GETTING_STARTED.RE);
  const scriptDocsSection = readme.getSection(HEADERS.SCRIPTS.RE);
  const docLinksBlock = buildDocumentationLinksBlock({
    header: HEADERS.GETTING_STARTED.STRING,
    introduction: 'To get started, take a look at the documentation listed below:\n',
    repoRoot,
  });
  const licenseSection = readme.getSection(HEADERS.LICENSE.RE);

  if (!mainHeader) {
    mainHeader = new ReadmeBlock({
      header: `# ${repoName}`,
    });
    readme.prependBlock(mainHeader);
  }

  if (gettingStartedSection) {
    gettingStartedSection.content = docLinksBlock.content;
  } else {
    readme.appendBlock(docLinksBlock, mainHeader);
  }

  if (scriptDocsSection) {
    scriptDocsSection.content = formatScriptDocs(scriptDocs).content;
  } else {
    const scriptDocsBlock = formatScriptDocs(scriptDocs);
    readme.appendBlock(scriptDocsBlock, gettingStartedSection);
  }

  if (!licenseSection) {
    readme.appendBlock(Readme.getLicenseBlock());
  }

  // TOC goes last since it depends on the rest of the readme.
  if (tocSection) {
    tocSection.content = readme.getTocBlock(0, '  ').content;
  } else {
    readme.appendBlock(readme.getTocBlock(), mainHeader);
  }

  return readme.export();
}

/*
 * Reads the package.json and README.md files, and generates a standardized {@link Readme}, exports it and writes to disk.
 */
async function main(): Promise<void> {
  /*
   * Assumption: README.md and package.json are located in the ${repoRoot} directory
   */
  const repoRoot = getRepoRoot();
  const resolvedRepoRoot = isAbsolute(repoRoot) ? repoRoot : resolve(join(process.cwd(), repoRoot));
  const readmePath = join(resolvedRepoRoot, 'README.md');
  let readmeContent = '';
  try {
    readmeContent = readFileSync(readmePath, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') {
      readmeContent = '';
    } else {
      throw new Error(e);
    }
  }
  const packageJsonContent = JSON.parse(readFileSync(join(resolvedRepoRoot, 'package.json'), 'utf8'));
  const scriptDocs = packageJsonContent.scriptsDocumentation || {};
  const repoName = (packageJsonContent.name || 'README').trim();

  writeFileSync(readmePath, standardize(readmeContent, scriptDocs, repoRoot, repoName));
}

if (__filename === process?.mainModule?.filename) {
  main();
}
