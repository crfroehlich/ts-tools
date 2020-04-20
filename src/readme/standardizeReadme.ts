/*
  eslint-disable
    complexity,
    sonarjs/cognitive-complexity,
*/
import { readFileSync, writeFileSync } from 'fs';
import glob from 'glob';
import { isAbsolute, join, resolve } from 'path';
import { Readme, ReadmeBlock } from './readme';
import { DocLinksParams, ScriptDocs } from './types';
import { GLOB_OPTIONS } from '../env/files';
import { LogLevel, LogOutput, getLogger } from '../logger';

const log = getLogger(
  {
    logLevel: LogLevel.INFO,
    serviceName: 'js-tools/standardize-readme',
    transports: [LogOutput.CONSOLE],
  },
  true,
);

/**
 * Defines known headers that we will parse
 * @remarks `STRING` is for inserting new sections. `FIELD` is regex for matching sections.
 * @public
 */
export const HEADERS = {
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
  ENV: {
    STRING: '## Environment Variables',
    RE: /^ *#* *Environment Variables/,
  },
};

/**
 * For each documented script in package.json, create documentation in README
 * @param docs - a {@link ScriptDocs} object containing documentation objects describing
 * package.json scripts.
 * @public
 * @returns a {@link ReadmeBlock} whose content is a formatted {@link ScriptDocs}.
 */
export const formatScriptDocs = (docs: ScriptDocs): ReadmeBlock => {
  const header = HEADERS.SCRIPTS.STRING;
  const content = Object.keys(docs)
    .map((scriptName): string => {
      const { description } = docs[scriptName];
      return `- \`yarn ${scriptName}\`: ${description}`;
    })
    .join('\n');

  return new ReadmeBlock({
    header,
    content,
  });
};

/**
 * For each documented environment variable in package.json, create documentation in README
 * @param docs - a {@link ScriptDocs} object containing documentation objects describing environment variables.
 * @public
 * @returns a {@link ReadmeBlock} whose content is a formatted {@link ScriptDocs}.
 */
export const formatEnvDocs = (docs: ScriptDocs): ReadmeBlock => {
  const header = HEADERS.ENV.STRING;
  const content = Object.keys(docs)
    .map((envName): string => {
      const { description } = docs[envName];
      return `- \`${envName}\`: ${description}`;
    })
    .join('\n');

  return new ReadmeBlock({
    header,
    content,
  });
};

/**
 * Iterates over all the markdown files in the project to build a tree of links to each document
 * @param params - {@link DocLinksParams} a doc links section header, an introductory paragraph, and a path to the repository.
 * @public
 * @returns a {@link ReadmeBlock} of relative links to the documents in the standardized documentation path
 */
export function buildDocumentationLinksBlock({
  header = '## Getting Started',
  introduction = '',
}: DocLinksParams): ReadmeBlock {
  const docLinksContent: string[] = [];
  const files = glob.sync('**/*.md', GLOB_OPTIONS);

  let lastPath = '';
  /* eslint-disable-next-line complexity */
  files.forEach((fileName) => {
    try {
      const content = readFileSync(fileName, 'utf-8');
      const lines = content.split('\n');
      const firstHeader = lines.find((line) => /^ *#/.test(line)) || '';
      const titleParts = firstHeader.split(' ').slice(1);
      if (fileName.toLowerCase() !== 'readme.md') {
        const segments = fileName.split('/');
        const path = segments.slice(0, segments.length - 1).join('/');
        if (path !== lastPath) {
          lastPath = path;
          docLinksContent.push(`- ${lastPath}`);
        }
        const link = `  - [${titleParts.join(' ')}](${fileName})`;
        docLinksContent.push(link);
      }
    } catch (e) {
      log.error(e.toString());
    }
  });
  const content = `${introduction ? `${introduction}\n` : ''}${docLinksContent.join('\n')}`;
  return new ReadmeBlock({ header, content });
}

/**
 * Normalizes all documentation in the project.
 * @param content - readme text content.
 * @param title - name of the H1 header
 * @param scriptDocs - a {@link ScriptDocs} object containing documentation on package.json scripts.
 * @param envDocs - a {@link ScriptDocs} object containing documentation for environment variables
 * @param repoRoot - the name of the repository, used as a fallback for the top-level readme header if it's missing.
 * @public
 * @returns an exported {@link Readme} instance.
 */
export function standardize(
  content: string,
  title: string,
  scriptDocs?: ScriptDocs,
  envDocs?: ScriptDocs,
  repoRoot?: string,
): string {
  /**
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
  if (repoRoot) {
    const gettingStartedSection = readme.getSection(HEADERS.GETTING_STARTED.RE);
    const scriptDocsSection = readme.getSection(HEADERS.SCRIPTS.RE);
    const envDocsSection = readme.getSection(HEADERS.ENV.RE);
    const docLinksBlock = buildDocumentationLinksBlock({
      header: HEADERS.GETTING_STARTED.STRING,
      introduction: 'To get started, take a look at the documentation listed below:\n',
      repoRoot,
    });
    const licenseSection = readme.getSection(HEADERS.LICENSE.RE);

    if (!mainHeader) {
      mainHeader = new ReadmeBlock({
        header: `# ${title}`,
      });
      readme.prependBlock(mainHeader);
    }

    if (gettingStartedSection) {
      gettingStartedSection.content = docLinksBlock.content;
    } else {
      readme.appendBlock(docLinksBlock, mainHeader);
    }
    if (scriptDocs) {
      if (scriptDocsSection) {
        scriptDocsSection.content = formatScriptDocs(scriptDocs).content;
      } else {
        const scriptDocsBlock = formatScriptDocs(scriptDocs);
        readme.appendBlock(scriptDocsBlock, gettingStartedSection);
      }
    }
    if (envDocs) {
      if (envDocsSection) {
        envDocsSection.content = formatEnvDocs(envDocs).content;
      } else {
        const envDocsBlock = formatEnvDocs(envDocs);
        readme.appendBlock(envDocsBlock, gettingStartedSection);
      }
    }

    if (!licenseSection) {
      readme.appendBlock(Readme.getLicenseBlock());
    }
  }

  // TOC goes last since it depends on the rest of the readme.
  if (tocSection) {
    const toc = readme.getTocBlock(0, '  ');
    if (toc) {
      tocSection.content = toc.content;
    }
  } else {
    const toc = readme.getTocBlock();
    if (toc) {
      readme.appendBlock(toc, mainHeader);
    }
  }

  return readme.export();
}

/**
 * Reads the package.json and README.md files, and generates a standardized {@link Readme}, exports it and writes to disk.
 * @public
 */
export async function main(): Promise<void> {
  const repoRoot = __dirname;
  const resolvedRepoRoot = isAbsolute(repoRoot) ? repoRoot : resolve(join(process.cwd(), repoRoot));
  const packageJsonContent = JSON.parse(readFileSync('package.json', 'utf8'));
  const scriptDocs = packageJsonContent.scriptsDocumentation;
  const envDocs = packageJsonContent.envDocumentation;
  const repoName = (packageJsonContent.name || 'README').trim();

  glob('**/*.md', GLOB_OPTIONS, (er: Error | null, files: string[]) => {
    if (er) {
      log.error(er.toString());
    }
    files.forEach((fileName) => {
      log.info(`Standardized ${fileName}`);
      try {
        const readmeContent = readFileSync(fileName, 'utf-8');
        if (fileName.toLowerCase() === 'readme.md') {
          writeFileSync(fileName, standardize(readmeContent, repoName, scriptDocs, envDocs, resolvedRepoRoot));
        } else {
          writeFileSync(fileName, standardize(readmeContent, fileName));
        }
      } catch (e) {
        log.error(e.toString());
      }
    });
  });
}

if (__filename === process?.mainModule?.filename) {
  main();
}
