export type Query = string | RegExp;
export type BlockContent = string[];

export interface Content {
  type: 'content';
  header: string;
  content: BlockContent;
};
export interface Code {
  type: 'code';
  content: BlockContent;
};
export type Block = Code | Content;

export type IndexedBlocks = Map<string, Content[]>;

