/*
 * Used to match against a content header.
 */
export type Query = string | RegExp;

/*
 * An array of strings representing the content section (no header) of a markdown section.
 */
export interface Block {
  header?: string;
  content?: string;
}

export interface DocLinksParams {
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

export interface ScriptDoc {
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
