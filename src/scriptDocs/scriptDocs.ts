import { readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { Block, Readme } from '../readme/readme';

const SCRIPT_DIR = __dirname;

interface PatchData {
  readme: string;
  targetHeader: string;
  updates: string;
}

interface ScriptDoc {
  description: string;
  dev: boolean;
}

export interface ScriptsDocs {
  [index: string]: ScriptDoc;
}

export function formatScriptDocs(docs: ScriptsDocs): string {
  return Object.keys(docs)
    .map((scriptName): string => {
      const { description } = docs[scriptName];
      return `\`yarn ${scriptName}\`\n- ${description}\n`;
    })
    .join('\n');
}

interface ReadmeUpdates {
  path: string;
  content: string;
  target: string;
}

export async function updateReadme({ path, content, target }: ReadmeUpdates): Promise<string> {
  let readme;
  try {
    readme = await new Readme(path).parse();
  } catch (e) {
    throw new Error(e);
  }
  const scriptDocsSection = readme.getSection(target);
  if (scriptDocsSection) {
    readme.setSection(target, content);
  } else {
    const newBlock: Block = {
      header: target,
      content: content.split('\n'),
    };
    readme.append(newBlock);
  }
  return readme.export();
}

/* istanbul ignore next */
function main(rootPath: string | null): void {
  const rootDir = process.cwd() || SCRIPT_DIR;
  const packageJSONPath = join(SCRIPT_DIR, 'package.json');
  const packageJSON = JSON.parse(readFileSync(packageJSONPath, 'utf8'));
  const { scriptsDocumentation } = packageJSON;
  const updates = formatScriptDocs(scriptsDocumentation);
  const readmePath = rootPath || join(SCRIPT_DIR, '..', '..', 'README.md');

  const updatedReadme = updateReadme({
    path: readmePath,
    content: updates,
    target: '### `package.json` scripts',
  }).then((newReadme: string): void => {
    writeFileSync(join(SCRIPT_DIR, '..', 'README.md'), updatedReadme);
  });
}

// if the main module is this filename, it's being run a script.
// execute top level code in this case only.

/* istanbul ignore next */
if (__filename === process?.mainModule?.filename) {
  if (['-h', '--help'].includes(process.argv[2])) {
    process.stdout.write('usage: scriptDocs [rootPath]');
    process.exit(0);
  }

  /*
   * TODO: generates script docs using in ../Readme
   * user passess in 'scriptDocs README.md', shouild take path of README.md
   *
   */
  const userSuppliedReadmePath = process.argv[2];
  main(userSuppliedReadmePath || null);
}

export default formatScriptDocs;
