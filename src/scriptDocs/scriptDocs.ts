import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as stdio from 'stdio';
import { Readme } from '../readme/readme';
import { Block } from '../readme/types';

export interface ScriptDoc {
  /*
   * yarn script description property.
   */
  description: string;

  /*
   * flag as to whether script is for devs or not, for potential future programmatic organization.
   */
  dev: boolean;
}

export interface ScriptsDocs {
  /*
   * A string to {@link ScriptDoc}-block mapping.
   */
  [index: string]: ScriptDoc;
}

/*
 * @param docs - a {@link ScriptDocs} object
 *
 * @returns a string composed of formatted {@link ScriptDocs} joined together.
 */
export const formatScriptDocs = (docs: ScriptsDocs): string => {
  return Object.keys(docs)
    .map((scriptName): string => {
      const { description } = docs[scriptName];
      return `\`yarn ${scriptName}\`\n- ${description}\n`;
    })
    .join('\n');
};

interface ReadmeUpdates {
  /*
   * The string content you want to replace in the readme.
   */

  content: string;

  /*
   * The path to the readme file you want to load and update.
   */

  path: string;

  /*
   * A string matching the section in the readme whose content is to be replaced.
   *
   */
  target: string;
}

/*
 * Updates a section from a readme filepath if the file at that path exists
 * and the target section and is successfully matched.
 *
 * @param updates - a {@link ReadmeUpdates}
 *
 * @returns a Promise-wrapped string with the entire updated readme.
 *
 */

const updateReadme = async (updates: ReadmeUpdates): Promise<string> => {
  const { path, content, target } = updates;
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
};

/*
 * @param packageJSONPath - path to package.json with the scriptsDocumentation object
 * @param readmePath - path to target README.md to update
 *
 * @returns a void Promise
 */

export async function updateScriptDocs(packageJSONPath: string, readmePath: string): Promise<void> {
  const packageJSON = JSON.parse(readFileSync(packageJSONPath, 'utf8'));
  const { scriptsDocumentation } = packageJSON;
  const updates = formatScriptDocs(scriptsDocumentation);

  const updatedReadme = await updateReadme({
    path: readmePath,
    content: updates,
    target: '### `package.json` scripts',
  });

  writeFileSync(readmePath, updatedReadme);
}

if (process?.mainModule?.filename === __filename) {
  const optsDef = {
    'json-file': {
      key: 'p',
      description: 'path to a json file containing a scriptsDocumentation object',
      multiple: true,
      required: true,
    },
    'readme-file': {
      key: 'r',
      description: 'path to a a README.md file target to update with script documentation',
      multiple: true,
      required: true,
    },
  };

  const opts = stdio.getopt(optsDef) || {};
  const jsonPath = join(process.cwd(), opts['json-file'].toString());
  const readmePath = join(process.cwd(), opts['readme-file'].toString());

  updateScriptDocs(jsonPath, readmePath);
}
