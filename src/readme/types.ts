/**
 * Used to match against a content header.
 * @public
 */
export type Query = string | RegExp;

/**
 * An array of strings representing the content section (no header) of a markdown section.
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
   * A string representing the header line for the link block to standard documentation files.
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
 * Represents a script or environment variable doc block in package.json
 * @public
 */
export interface ScriptDoc {
  /**
   * script doc description property.
   */
  description: string;

  /**
   * flag as to whether script is for devs or not.
   * not currently used, but potentially useful for future organization.
   */
  dev: boolean;
}

/**
 * Collection of named {@link ScriptDoc} docs
 * @public
 */
export interface ScriptDocs {
  /**
   * A string to {@link ScriptDoc}-block mapping.
   */
  [index: string]: ScriptDoc;
}

/**
 * Represents an environment variable doc block in package.json
 * @public
 */
export interface EnvDoc {
  /**
   * environment variable doc description property.
   */
  description: string;

  /**
   * variable's default value
   */
  defaultValue: string;
}

/**
 * Collection of named {@link EnvDoc} docs
 * @public
 */
export interface EnvDocs {
  /**
   * A string to {@link EnvDoc}-block mapping.
   */
  [index: string]: EnvDoc;
}
