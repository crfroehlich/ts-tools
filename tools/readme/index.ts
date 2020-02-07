import { promisify } from 'util';
import { readFile, writeFile } from 'fs';
import { isAbsolute, join } from 'path';

export type SectionTarget = string | RegExp;
export type BlockContent = string[];
export interface Block {
  header: string;
  content: BlockContent;
};
export type IndexedBlocks = Map<string, Block[]>;


export default class Readme {

  static isHeader = (line: string) => /^ *#+ /.test(line);
  static isCodeStartTag = (line: string) => /^ *```[^`]*$/.test(line);
  static isCodeEndTag = (line: string) => /^ *``` *$/.test(line);

  path: string;
  blocks: Block[] = [{
    header: '_root',
    content: []
  }];
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

    let currentHeaderKey = this.blocks[0].header;
    let inCodeBlock = false;

    for (const line of lines) {

      // transition into code section
      if (!inCodeBlock && Readme.isCodeStartTag(line)) {
        inCodeBlock = true;
        continue;
      }

      // transition out of code section
      if (inCodeBlock && Readme.isCodeEndTag(line)) {
        inCodeBlock = false;
        continue;
      }

      // inside of code section, no transition
      if (inCodeBlock && !Readme.isCodeEndTag(line)) {
        continue;
      }

      // new block
      if (Readme.isHeader(line)) {

        currentHeaderKey = line;
        this.blocks.push({
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

  index() {

    const indexed: IndexedBlocks = new Map([]);

    for (const block of this.blocks) {

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
      if (block.header !== '_root') {
        output += block.header + '\n';
      }
      output += block.content.join('\n') + '\n'; 
    }

    return output;
  }

  getSection(target: SectionTarget, strict=false): Block | null {

    return this.getSections(target)[0] || null;

  }

  getSections(target: SectionTarget, strict=false): Block[] {

    if (typeof target === 'string') {
      for (const [key, blocks] of this.indexedBlocks.entries()) { 
        if (strict) {
          if (key === target) {
            return blocks;
          }
        } else {
          if (key.includes(target)) {
            return blocks;
          }
        }
      }
    } else if (target instanceof RegExp) {

      for (const [key, blocks] of this.indexedBlocks.entries()) { 
        if (target.test(key)) {
          return blocks;
        }
      }
    }

    return [];

  }

  setSection(target: SectionTarget, content: string = '') {

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
  readme.setSection('Table of Contents', 'FAKE TABLE OF CONTENTS'); 
  console.log(readme.export());
  console.log(readme.blocks);

}

if (__filename === process?.mainModule?.filename) {
  main()
}
