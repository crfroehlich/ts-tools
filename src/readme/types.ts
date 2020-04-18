/**
 * @summary Used to match against a content header.
 * @public
 */
export type Query = string | RegExp;

/**
 * @summary An array of strings representing the content section (no header) of a markdown section.
 * @public
 */
export interface Block {
  header?: string;
  content?: string;
}

/**
 * @public
 */
export interface DocLinksParams {
  /**
   * @summary A string representing the header line for the link block to standard documentation files.
   */
  header: string;

  /**
   * An string representing an introduction to the standard documentation links block.
   */
  introduction?: string;

  /**
   * path to the repo root for calculation of a relative path to the standard documentation directory.
   */
  repoRoot: string | null;
}

/**
 * @public
 */
export interface ScriptDoc {
  /**
   * script doc description property.
   */
  description: string;

  /**
   * flag as to whether script is for devs or not.
   * not currently used, but potentially useful for f  uture organization.
   */
  dev: boolean;
}

/**
 * @public
 */
export interface ScriptDocs {
  /**
   * A string to {@link ScriptDoc}-block mapping.
   */
  [index: string]: ScriptDoc;
}
