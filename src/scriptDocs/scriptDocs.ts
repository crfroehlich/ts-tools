import { readFileSync } from 'fs';
import { join } from 'path';
import { getopt } from 'stdio';
import { Readme } from '../readme/readme';

interface ScriptDoc {
  /*
   * script doc description property.
   */
  description: string;

  /*
   * flag as to whether script is for devs or not. not currently used, but potentially useful for future organization.
   */
  dev: boolean;
}

interface ScriptsDocs {
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

interface ReadmeUpdate {
  /*
   * The string content you want to replace in the readme.
   */
  content?: string;

  /*
   * The path to the readme file you want to load and update.
   */
  path?: string | null;

  /*
   * A string matching the section in the readme whose content is to be replaced.
   *
   */
  target: string;
}

/*
 * @param packageJSONPath - path to package.json with the scriptsDocumentation object
 * @param readmePath - path to target README.md to update
 *
 * @returns the updated readme in the form of a string
 */

export function updateScriptDocs(docs: ScriptsDocs, readmeContent: string): string {
  const updates = formatScriptDocs(docs);
  const readme = new Readme(readmeContent).parse();
  const target = '### `package.json` scripts';

  if (readme.getSection(target)) {
    readme.setSection(target, updates);
  } else {
    readme.append({
      header: target,
      content: updates.split('\n'),
    });
  }

  return readme.export();
}

/* istanbul ignore next */
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

  const opts = getopt(optsDef) || {};
  const jsonPath = join(process.cwd(), opts['json-file'].toString());
  const readmePath = join(process.cwd(), opts['readme-file'].toString());
  const readmeContent = readFileSync(readmePath, 'utf8');
  const { scriptsDocumentation: scriptDocs } = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const updatedReadme = updateScriptDocs(scriptDocs, readmeContent);

  process.stdout.write(`${updatedReadme}\n`);
}
