import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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

function formatScriptsDocumentation(docs: ScriptsDocs): string {
  return Object.keys(docs)
    .map((scriptName) => {
      const { description } = docs[scriptName];
      return `\`yarn ${scriptName}\`\n- ${description}\n`;
    })
    .join('\n');
}

function updateReadme({ readme, targetHeader, updates }: PatchData): string {
  const lines = readme.split('\n');
  const linesToInsert = [targetHeader, '\n', ...updates.split('\n')];
  const targetStart = lines.findIndex((line) => line === targetHeader);

  // case 1: scripts section docs doesn't exist
  if (targetStart < 0) {
    return `${readme}\n${linesToInsert.join('\n')}\n`;
  }

  const nextSectionOffset = lines.slice(targetStart + 1).findIndex((line) => /^#{1,3} /.test(line));

  // case two: scripts is last section
  if (nextSectionOffset < 0) {
    return [...lines.slice(0, targetStart), ...linesToInsert, '\n'].join('\n');
  }

  const restIndex = targetStart + 1 + nextSectionOffset;

  // case 3: scripts documentation exists between other sibling or parent sections
  return [...lines.slice(0, targetStart), ...linesToInsert, '\n', ...lines.slice(restIndex)].join('\n');
}

/* istanbul ignore next */
function main() {


  const packageJSONPath = join(__dirname, '..', 'package.json');
  const readmePath = join(__dirname, '..', 'README.md');
  const readme = readFileSync(readmePath, 'utf8');
  const packageJSON = JSON.parse(readFileSync(packageJSONPath, 'utf8'));
  const { scriptsDocumentation } = packageJSON;
  const updates = formatScriptsDocumentation(scriptsDocumentation);

  const updatedReadme = updateReadme({
    readme,
    updates,
    targetHeader: '### `package.json` scripts',
  });

  writeFileSync(join(__dirname, '..', 'README.md'), updatedReadme);

}

// if the main module is this filename, it's being run a script.
// execute top level code in this case only.

/* istanbul ignore next */
if (__filename === process?.mainModule?.filename) {
  main()
}

export { formatScriptsDocumentation, updateReadme };
export default formatScriptsDocumentation;
