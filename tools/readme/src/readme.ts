import { promisify } from 'util';
import { readFile, writeFile } from 'fs';
import { isAbsolute, join, resolve } from 'path';
import { 
  Block,
  BlockContent,
  Code,
  Content,
  IndexedBlocks,
  Query
} from './types'; 

/**
 * The Readme class is responsible for representing a readme file plus programmatic manipulations and transformations of it.
 */

export default class Readme {

  public static isHeader = (line: string) => /^ *#+ /.test(line);
  public static isCodeStartTag = (line: string) => /^ *```[^`]*$/.test(line);
  public static isCodeEndTag = (line: string) => /^ *``` *$/.test(line);
  public static isRootNode = (block: Block) => block.type === 'content' && block.header === '_root'; 
  public static isContentBlock = (block: Block): block is Content => block.type === 'content'; 
  public static sanitize = (line:string): string => line.replace(/ /g,'-').replace(/[^a-zA-Z0-9-]/g,''); // ascii-centric
  public static repeat = (s: string, count: number): string => [...Array(count).keys()].map(_ => s).join('');
  public static makeLink = (...textParts: string[]) => `[${textParts.join(' ')}](#${Readme.sanitize(textParts.join('-')).toLowerCase()})`;

  public static headerFound(header: string, query: Query, strict: boolean = false):Boolean {

    // doesnt match case insensitive. should it?

    if (typeof query === 'string') {

      if (strict && header === query) {
        return true;
      } else if (header.includes(query)) {
        return true;
      }

    } else if (query instanceof RegExp && query.test(header)) {
      return true;
    }

    return false;

  }

  /*
   * path resolved relative to the calling code's cwd, resolved with 'path.resolve'.
   */
  path: string;

  /*
   * A list of {@link Content} or {@link Code} blocks.
   */
  blocks: Block[] = [];

  /*
   * A map of {@link Content} blocks.
   */
  indexedBlocks: IndexedBlocks = new Map([]);

  /*
   * @param path - path to the readme file to be parsed.
   *
   */
  constructor(path: string) {

    if (path.trim().length === 0) {
      throw new Error(`invalid path: ${path}`);
    }

    this.path = resolve(path);

  }


  /*
   * Reads the readme at {@link path} and returns it as a Promise-wrapped string. 
   */
  async getReadme():Promise<string> {

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

  /*
   * Parses the readme file at {@link path} and returns it as Promise-wrapped Readme instance for chaining.
   */
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

    // basic state machine to detect, line-by-line, which part of the readme
    for (const line of lines) {

      // transition into code section
      if (!inCodeBlock && Readme.isCodeStartTag(line)) {

        inCodeBlock = true;

        const newBlock: Code = {
          type: 'code',
          content: [line]
        };
        this.blocks.push(newBlock)

        // transition out of code section
      } else if (inCodeBlock && Readme.isCodeEndTag(line)) {

        inCodeBlock = false;

        this.blocks[this.blocks.length - 1].content.push(line);

        // still inside code section
      } else if (inCodeBlock && !Readme.isCodeEndTag(line)) {

        this.blocks[this.blocks.length - 1].content.push(line);

        // entered new content block
      } else if (Readme.isHeader(line)) {

        currentHeaderKey = line;
        this.blocks.push({
          type: 'content',
          header: currentHeaderKey,
          content: []
        });

        // still inside of a content block
      } else {

        const latestBlock = this.blocks[this.blocks.length - 1]; 
        latestBlock.content.push(line)

      }
    }

    this.index();

    return this;

  }

  /*
   * Indexes {@link blocks} by header to support efficient querying.
   */

  public index() {

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

  /* 
   * Generates a table of contents with links to respective sections.
   *
   * @param indent - a string used to pad indentations for the list indentations. 
   *
   */
  toc(indent:string = '  '):string {

    return '\n## Table of Contents' + '\n' + this.blocks
      .filter((block): block is Content => Readme.isContentBlock(block) && !Readme.isRootNode(block))
      .map(block => block.header)
      .map(header => {
        const [ marker, ...text ] = header.trim().split(' ');
        const indentCount = marker.length - 1;
        const linkedHeader = Readme.makeLink(...text);
        return `${Readme.repeat(indent, indentCount)}+ ${linkedHeader}`;
      })
      .slice(1) // ignore title block
      .join('\n') + '\n';

  }

  /*
   *
   * Renders the parsed readme {@link Block} list as a string.
   *
   */
  export():string {

    let output = '';

    for (const block of this.blocks) {
      if (block.type === 'content') {
        if (!Readme.isRootNode(block)) {
          output += block.header + '\n';
        }
      }
      output += block.content.join('\n') + '\n'; 
    }

    return output;

  }


  /* 
   * Find a single content (non-code) block by header.
   *
   * @param content - a {@link Block} object to insert before a matched content header. 
   * @param strict - whether to perform a strict string match or not against a content header.
   */
  getSection(target: Query, strict=false): Content | null {

    return this.getSections(target)[0] || null;

  }

  /* 
   * Find content (non-code) blocks by header.
   *
   * @param content - a {@link Block} object to insert before a matched content header. 
   * @param strict - whether to perform a strict string match or not against a content header.
   */
  getSections(target: Query, strict:boolean = false): Content[] {

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


  /*
   * Prepends content to the beginning of the readme content list.
   *
   * @param content - a {@link Block} object to insert before a matched content header. 
   * @param strict - whether to perform a strict string match or not against a content header.
   *
   */
  prepend(content: Block, strict: boolean = false) {
    this.blocks.unshift(content);
  }


  /*
   * Appends content at end of the readme content list.
   *
   * @param content - a {@link Block} object to insert before a matched content header. 
   * @param strict - whether to perform a strict string match or not against a content header.
   *
   */

  append(content: Block, strict: boolean = false) {
    this.blocks.push(content);
  }

  /*
   * Inserts the content after a matching content block. 
   *
   * @param target - a {@link Query} object to match a content section. 
   * @param content - a {@link Block} object to insert after a matched content header. 
   * @param strict - whether to perform a strict match or not against a content header.
   *
   */
  insertAfter(target: Query, content: Block, strict: boolean = false) {

    let index = 0;
    for (let i = 0; i < this.blocks.length; ++i) {

      const block = this.blocks[i];

      if (Readme.isContentBlock(block) && Readme.headerFound(block.header, target, strict)) {
        this.blocks.splice(i + 1, 0, content);
        return
      }

    }

  }


  /*
   * Inserts the content after a matching content block. 
   *
   * @param target - a {@link Query} object to match a content section. 
   * @param content - a {@link Block} object to insert before a matched content header. 
   * @param strict - whether to perform a strict string match or not against a content header.
   *
   */
  insertBefore(query: Query, content: Block, strict: boolean = false) {

    let index = 0;
    for (let i = 0; i < this.blocks.length; ++i) {

      const block = this.blocks[i];

      if (Readme.isContentBlock(block) && Readme.headerFound(block.header, query, strict)) {
        this.blocks.splice(i, 0, content);
        return
      }

    }

  }

  /*
   * Set the first found section (targeted by string/regex) to the supplied content
   *
   * @param target - a {@link Query} object to match a content section for replacement. 
   * @param content - a {@link Block} object to insert after a matched content header. 
   *
   */
  setSection(target: Query, content: string = '') {

    const sections: Block[] = this.getSections(target);

    if (sections.length > 0) {
      sections[0].content = content.split('\n');
    }

  }

}
