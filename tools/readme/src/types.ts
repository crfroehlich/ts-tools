/*
 * Used to match against a content header.
 */
export type Query = string | RegExp;

/*
 * An array of strings parsed by splitting the content section on newlines.
 */
export type BlockContent = string[];

/*
 * A representation of a {@link Content} block.
 */
export interface Content {
  type: 'content';
  header: string;
  content: BlockContent;
};

/*
 * A representation of a {@link Code} block.
 */

export interface Code {
  /*
   * type is the discriminant
   */
  type: 'code';
  content: BlockContent;
};

/*
 * A discriminated union type representing a block of Readme {@link Content} or Readme {@link Code}.
 */
export type Block = Code | Content;

/*
 * A map of block header strings to {@link Content} arrays. The content arrays have been indexed 
 * by header to support efficient querying.
 */
export type IndexedBlocks = Map<string, Content[]>;
