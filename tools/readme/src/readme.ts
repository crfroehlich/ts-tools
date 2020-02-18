import { promisify } from 'util';
import { readFile, writeFile } from 'fs';
import { isAbsolute, join, resolve } from 'path';
import { Block, IndexedBlocks, Query } from './types'; 

/**
 * The Readme class represents a markdown README file and provides an API for programmatic transformations of it.
 */

export default class Readme {

  public static isHeader = (line: string) => /^ *#+ /.test(line);
  public static isCodeStartTag = (line: string) => /^ *```[^`]*$/.test(line);
  public static isCodeEndTag = (line: string) => /^ *``` *$/.test(line);
  public static isRootNode = (block: Block) => block.header === '_root'; 
  public static sanitize = (line:string): string => line.replace(/ /g,'-').replace(/[^a-zA-Z0-9-]/g,''); // ascii-centric
  public static repeat = (s: string, count: number): string => [...Array(count).keys()].map(_ => s).join('');
  public static makeLink = (...textParts: string[]) => {
    return `[${textParts.join(' ')}](#${Readme.sanitize(textParts.join('-')).toLowerCase()})`;
  }

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
  indexedBlocks: IndexedBlocks = new Map();

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

    const rootBlock: Block = {
      header: '_root',
      content: [] 
    };

    this.blocks.push(rootBlock);
    let currentHeaderKey = rootBlock.header;
    let inCodeBlock = false;

    // basic state machine to detect, line-by-line, which part of the readme
    for (const line of lines) {

      // in code block, don't parse header tags as new content blocks
      if (inCodeBlock) {

        if (Readme.isCodeEndTag(line)) {
          inCodeBlock = false;
        }

        this.blocks[this.blocks.length - 1].content.push(line);

      } else {
        // in regular content block

        if (Readme.isHeader(line)) {
          const newBlock = {
            header: line,
            content: []
          };
          this.blocks.push(newBlock);
          // maybe index previous block here?
        } else {

          if (Readme.isCodeStartTag(line)) {
            inCodeBlock = true;
          }
          // regular content line
          this.blocks[this.blocks.length - 1].content.push(line);
        }
      }

    }
        
    this.index();

    return this;

  }

  /*
   * Indexes {@link blocks} by header to support efficient querying.
   */

  public index() {

    const indexed: IndexedBlocks = new Map();

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

  /* 
   * Generates a table of contents for a specified subset of sections, to avoid
   * including the readme top level sections, and to provide greater user control.
   *
   * @insertionPoint - either a header-matching regex or an index into the readme sections
   * to match where the toc should be inserted, and where it should start counting headers.
   *
   * @param indent - a string used to pad indentations for the list indentations. 
   *
   * This does not replace an existing ToC.
   */
  toc(insertionPoint: Query | number = 1 , indent:string = '  '):string {

    const tocHeader = '## Table of Contents\n'; 
    let insertAt = -1;

    if (insertionPoint instanceof RegExp) {
      insertAt = this.blocks.findIndex(block => {
        return insertionPoint.test(block.header);
      });
    } else if (typeof insertionPoint === 'string') {
      insertAt = this.blocks.findIndex(block => {
        return block.header.includes(insertionPoint);
      });
    } else if (typeof insertionPoint === 'number') {
      insertAt = insertionPoint;
    }

    if (insertAt === -1) {
      return '';  //TODO: do i throw here instead?
    }

    // slice(2) is default to skip _root block and the readme top-level header
    const toc = this.blocks.slice(insertAt + 1).map(({ header }) => {
        const [ marker, ...text ] = header.trim().split(' ');
        const indentCount = marker.length - 1;
        const linkedHeader = Readme.makeLink(...text);
        return `${Readme.repeat(indent, indentCount)}+ ${linkedHeader}`;
      })
      .join('\n') + '\n';

    return `${tocHeader}${toc}`;

  }

  /*
   *
   * Renders the parsed readme {@link Block} list as a string.
   *
   */
  export():string {

    let output = '';

    for (const block of this.blocks) {
      if (!Readme.isRootNode(block)) {
        output += block.header + '\n';
      }
      output += block.content.join('\n') + '\n'; 
    }

    return output;

  }

  getSectionAt(index:number): Block | null {
    return this.blocks[index] || null;
  }


  /* 
   * Find a single content (non-code) block by header.
   *
   * @param content - a {@link Block} object to insert before a matched content header. 
   * @param strict - whether to perform a strict string match or not against a content header.
   */
  getSection(target: Query, strict=false): Block | null {

    return this.getSections(target)[0] || null;

  }

  /* 
   * Find content (non-code) blocks by header.
   *
   * @param content - a {@link Block} object to insert before a matched content header. 
   * @param strict - whether to perform a strict string match or not against a content header.
   */
  getSections(target: Query, strict:boolean = false): Block[] {

    const blocks = [];

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
    this.index();
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
    this.index();
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

    let index = this.blocks.findIndex(block => {
      return Readme.headerFound(block.header, target, strict);
    });

    if (index > -1) {
      this.blocks.splice(index + 1, 0, content);
    }

    this.index();

  }


  /*
   * Inserts the content after a matching content block. 
   *
   * @param target - a {@link Query} object to match a content section. 
   * @param content - a {@link Block} object to insert before a matched content header. 
   * @param strict - whether to perform a strict string match or not against a content header.
   *
   */
  insertBefore(target: Query, content: Block, strict: boolean = false) {

    let index = this.blocks.findIndex(block => {
      return Readme.headerFound(block.header, target, strict);
    });

    if (index > -1) {
      this.blocks.splice(index, 0, content);
    }

    this.index();

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
      this.index();
    }

  }

  setSectionAt(index:number, content:string):void {

    const internalIndex = index + 1; // includes the internal '_root' block
    if (internalIndex >= 1 && internalIndex <= this.blocks.length - 1) {
      const targetBlock = this.blocks[internalIndex]; 
      targetBlock.content = content.split('\n');
      this.index();

    } else {
      throw new Error(`Index out of range: ${index}`);
    }

  }

}
