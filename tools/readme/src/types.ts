/*
 * Used to match against a content header.
 */
export type Query = string | RegExp;

/*
 * An array of strings representing the content section (no header) of a markdown section.
 */
export type BlockContent = string[];

/*
 * A content block represents a markdown section, a header and {@link BlockContent}.
 */
export interface Content {
  type: 'content';
  header: string;
  content: BlockContent;
};

/*
 * A representation of a markdown code section, containing just {@link BlockContent}. 
 * Code is parsed to avoid picking up headers inside of code blocks. 
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
 * A map of header strings to {@link Content} arrays. The {@link Content} arrays have been indexed 
 * by header to support efficient querying.
 */
export type IndexedBlocks = Map<string, Content[]>;
