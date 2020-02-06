import { promisify } from 'util';
import { readFile, writeFile } from 'fs';

export type SectionTarget = string | RegExp;
export type BlockContent = string[];
export type IndexedBlocks = Map<string, BlockContent[]>; 
export interface Block {
  header: string;
  content: BlockContent;
};

export default class Readme {

  path: string | null;
  indexedBlocks: IndexedBlocks = new Map([]);
  orderedBlocks: Block[] = [];

  constructor(path: string | null = null) {

    this.path = path;

    if (this.path == null) {
      throw new Error('parse method requires a path to a readme file.');
    }

  }

  async parse() {

    const isHeader = (line: string) => /#+[ ]+/.test(line); 

    if (this.path == null) {
      return;
    }

    let readmeContent: string = '';
    try {
      readmeContent = await promisify(readFile)(this.path, 'utf8');
    } catch(e) {
      if (e.code === 'ENOENT') {
        console.log(`The file ${this.path} could not be found`);
        process.exit(1);
      }
    }
    const lines = readmeContent.split('\n');
    const indexedBlocks: IndexedBlocks = new Map();
    const orderedBlocks: Block[] = [];

    let currentHeaderKey = '_root';
    indexedBlocks.set(currentHeaderKey, [[]]);
    orderedBlocks.push({
      header: currentHeaderKey,
      content: [],
    });

    for (const line of lines) {

      // new block, (possibly a duplicate header).
      if (isHeader(line)) {

        currentHeaderKey = line; 

        // add a numerically indexed block, doesn't matter if we've seen before or not
        // because it's ordered
        orderedBlocks.push({
          header: currentHeaderKey,
          content: [],
        });

        // a duplicate content header. push a new array for content
        const block = indexedBlocks.get(currentHeaderKey) 
        if (block) {
          block.push([]);
        } else {

          // create new array for block, doesn't exist yet
          indexedBlocks.set(currentHeaderKey, [[]])

        }


      } else {

        // within same block

        const latestBlock = orderedBlocks[orderedBlocks.length - 1];
        latestBlock.content.push(line)

        indexedBlocks.set(currentHeaderKey, indexedBlocks.get(currentHeaderKey) || [[]]);
        const currentIndexedBlocks = indexedBlocks.get(currentHeaderKey);
        if (Array.isArray(currentIndexedBlocks)) {
          currentIndexedBlocks[currentIndexedBlocks.length - 1].push(line);
        }

      }
    }

    this.indexedBlocks = indexedBlocks;
    this.orderedBlocks = orderedBlocks;

  }

  export():string {

    const [root, ...contentBlocks] = this.orderedBlocks;

    // edge case: empty file
    if (!contentBlocks && root.content.length === 0) {
      return '';
    }

    let output = '';
    for (const block of this.orderedBlocks) {
      if (block.header !== '_root') {
        output += block.header + '\n';
      }
      if (block.content.length > 0) {
        output += block.content.join('\n') + '\n';
      }

    }

    return output;

  }

  getSection(target: SectionTarget) {

    for (const [key, value] of this.indexedBlocks.entries()) {

      if (typeof target === 'string') {
        if (key.includes(target)) {
          return value;
        }
      } else if (target instanceof RegExp) {
        if (target.test(key)) {
          return value;
        }
      }

    }

  }

  //bug: the indexed and ordered sections aren't linked.
  setSection(target: SectionTarget, content: string = '') {

    for (const [key, value] of this.indexedBlocks.entries()) {

      let entry: IndexedBlocks = new Map([]);

      if (typeof target === 'string') {
        if (key.includes(target)) {
          this.indexedBlocks.set(key, [ content.split('\n') ]);
        }
      } else if (target instanceof RegExp) {
        if (target.test(key)) {
          this.indexedBlocks.set(key, [ content.split('\n') ]);
        }
      }

    }

  }

}

const main = async() => {
  const filename = process.argv.slice(2)[0];
  if (!filename) {
    throw new Error('Missing Filename parameter. readme <filename>');
    process.exit(1);
  }
  const readme = new Readme(filename);
  await readme.parse();
  readme.setSection(/#+ Table\ of\ Contents/, 'replaced toc with this crap');
  //console.log(readme.getSection(/#+ Table\ of\ Contents/));
  const newReadme = readme.export()
  console.log(newReadme);
}

if (__filename === process?.mainModule?.filename) {
  main()
}
