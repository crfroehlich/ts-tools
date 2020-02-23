/*
 * Used to match against a content header.
 */
export type Query = string | RegExp;

/*
 * An array of strings representing the content section (no header) of a markdown section.
 */
export interface Block {
  header: string;
  content: string[];
}

export type IndexedBlocks = Map<string, Block[]>;
