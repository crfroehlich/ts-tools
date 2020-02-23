import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Readme, Block } from '../readme/readme';

interface PatchData {
  readme: string;
  targetHeader: string;
  updates: string;
}

interface ScriptDoc {
  description: string;
  dev: boolean;
}

interface ScriptsDocs {
  [index: string]: ScriptDoc;
}

function formatScriptDocs(docs: ScriptsDocs): string {
  return Object.keys(docs)
    .map((scriptName) => {
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

async function updateReadme({ path, content, target }: ReadmeUpdates) {
  const readme = await new Readme(path).parse();
  const scriptDocsSection = readme.getSection(target);
  if (scriptDocsSection) {
    readme.setSection(target, content);
  } else {
    const newBlock: Block = {
      header: target,
      content: content.split('\n')
    }
    readme.append(newBlock);
  }
}

/* istanbul ignore next */
function main(): void {

  const packageJSONPath = join(__dirname, '..', 'package.json');
  const packageJSON = JSON.parse(readFileSync(packageJSONPath, 'utf8'));
  const { scriptsDocumentation } = packageJSON;
  const updates = formatScriptDocs(scriptsDocumentation);
  const readmePath = join(__dirname, '..', 'README.md');

  const updatedReadme = updateReadme({ 
    path: readmePath,
    content: updates,
    target: '### `package.json` scripts'
  });

  writeFileSync(join(__dirname, '..', 'README.md'), updatedReadme);
}

// if the main module is this filename, it's being run a script.
// execute top level code in this case only.

/* istanbul ignore next */
if (__filename === process?.mainModule?.filename) {
  main();
}

export default formatScriptDocs;
