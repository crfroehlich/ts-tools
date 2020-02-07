import { promisify } from 'util';
import { readFile, writeFile } from 'fs';
import { isAbsolute, join } from 'path';

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

export default class Readme {

  private static isHeader = (line: string) => /^ *#+ /.test(line);
  private static isCodeStartTag = (line: string) => /^ *```[^`]*$/.test(line);
  private static isCodeEndTag = (line: string) => /^ *``` *$/.test(line);

  path: string;
  blocks: Block[] = [
  ];
  indexedBlocks: IndexedBlocks = new Map([]);

  constructor(path: string) {

    if (path.trim().length === 0) {
      throw new Error(`invalid path: ${path}`);
    }
    this.path = isAbsolute(path) ? path : join(__dirname, path);

  }

  async getReadme() {

    let content: string = '';

    try {
      content = await promisify(readFile)(this.path, { encoding: 'utf8' });
    } catch(e) {
      if (e.code === 'ENOENT') {
        console.log(`The file ${this.path} could not be read.`);
        process.exit(1);
      }
    }

    return content;

  }

  async parse():Promise<Readme> {

    const content = await this.getReadme();
    const lines = content.split('\n');

    const rootBlock: Content = {
      type: 'content',
      header: '_root',
      content: []
    };
    this.blocks.push(rootBlock);
    let currentHeaderKey = rootBlock.header;
    let inCodeBlock = false;

    for (const line of lines) {

      // transition into code section
      if (!inCodeBlock && Readme.isCodeStartTag(line)) {

        inCodeBlock = true;

        const newBlock: Code = {
          type: 'code',
          content: [line]
        };
        this.blocks.push(newBlock)

      } else if (inCodeBlock && Readme.isCodeEndTag(line)) {

        inCodeBlock = false;

        this.blocks[this.blocks.length - 1].content.push(line);

      } else if (inCodeBlock && !Readme.isCodeEndTag(line)) {

        this.blocks[this.blocks.length - 1].content.push(line);

      } else if (Readme.isHeader(line)) {

        currentHeaderKey = line;
        this.blocks.push({
          type: 'content',
          header: currentHeaderKey,
          content: []
        });

      } else {

        const latestBlock = this.blocks[this.blocks.length - 1]; 
        latestBlock.content.push(line)

      }
    }

    this.index();

    return this;

  }

  private index() {

    const indexed: IndexedBlocks = new Map([]);

    for (const block of this.blocks) {

      if (block.type !== 'content') continue;

      const existingIndex = indexed.get(block.header);

      if (existingIndex) {
        existingIndex.push(block);
      } else {
        indexed.set(block.header, [block]);
      }

    }

    this.indexedBlocks = indexed;

  }

  export():string {

    let output = '';

    for (const block of this.blocks) {
      if (block.type === 'content') {
        if (block.header !== '_root') {
          output += block.header + '\n';
        }
      }
      output += block.content.join('\n') + '\n'; 
    }

    return output;

  }

  getSection(target: Query, strict=false): Content | null {

    return this.getSections(target)[0] || null;

  }

  getSections(target: Query, strict=false): Content[] {

    const blocks:Content[] = [];

    if (typeof target === 'string') {
      for (const [key, contentBlocks] of this.indexedBlocks.entries()) { 
        if (strict) {
          if (key === target) {
            blocks.push(...contentBlocks);
          }
        } else {
          if (key.includes(target)) {
            blocks.push(...contentBlocks);
          }
        }
      }
    } else if (target instanceof RegExp) {

      for (const [key, contentBlocks] of this.indexedBlocks.entries()) { 
        if (target.test(key)) {
          blocks.push(...contentBlocks);
        }
      }
    }

    return blocks;

  }

  setSection(target: Query, content: string = '') {

    const sections: Block[] = this.getSections(target);
    if (sections.length > 0) {
      sections[0].content = content.split('\n');
    }

  }

}

const main = async() => {

  const filename = process.argv.slice(2)[0];
  if (!filename) {
    throw new Error('Missing Filename parameter. readme <filename>');
    process.exit(1);
  }
  const readme = await new Readme(filename).parse();

}

if (__filename === process?.mainModule?.filename) {
  main()
}
