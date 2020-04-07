/* eslint-disable sonarjs/no-duplicated-branches */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-lonely-if */
import { format } from 'prettier';
import { Block, Query } from './types';

export type IndexedBlocks = Map<string, ReadmeBlock[]>;

/*
 * The ReadmeBlock represents the header and the content of a Readme section.
 * It exists to provide a way for the user to use methods returning {@link ReadmeBlock}
 * with the {@link Readme} instance.
 */
export class ReadmeBlock {
  /*
   * A parsed Markdown header.
   */
  header: string;

  /*
   * A parsed Markdown section.
   */
  content: string;

  /*
   * @param block - an object conforming to the {@link Block} interface
   */
  constructor(block: Block) {
    this.header = block.header || '';
    this.content = block.content || '';
  }

  /*
   * @returns a string formatting the combination of the header and the content lines.
   */
  toString(): string {
    return `${this.header}\n${this.content}\n`;
  }
}

/**
 * The Readme class represents a markdown README and provides an API for programmatic transformations of it.
 */

export class Readme {
  STANDARD_DOCS_PATH = 'docs';

  /*
   * @param line - string representing a single line from a readme content.
   *
   * @returns a boolean indicating whether the readme line is a header
   */
  public static isHeader = (line: string): boolean => /^ *#+ /.test(line);

  /*
   * @param line - string representing a single line from a readme content.
   *
   * @returns a boolean indicating whether the readme line is a code start tag.
   */
  public static isCodeStartTag = (line: string): boolean => /^ *```[^`]*$/.test(line);

  /*
   * @param line - string representing a single line from a readme content.
   *
   * @returns a boolean indicating whether the readme line is a code end tag.
   */
  public static isCodeEndTag = (line: string): boolean => /^ *``` *$/.test(line);

  /*
   * @param block - a {@link Block} object representing a content block in a parsed readme file.
   *
   * @returns a boolean indicating whether the readme line is a code end tag.
   */
  public static isRootNode = (block: Block): boolean => block.header === '_root';

  /*
   * @param line - string representing a single line from a readme content.
   *
   * @returns a github-sanitized string to be used as an anchor tag linking to another section of the same readme document.
   */
  public static sanitize = (line: string): string => line.replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, ''); // ascii-centric

  /*
   * @param s - a string to be repeated
   * @param count - the number of times a string should be repeated.
   *
   * @returns a string comprised of {@link s}, repeated {@link count} times.
   */
  public static repeat = (s: string, count: number): string => [...Array(count).keys()].map(() => s).join('');

  /*
   * @param header - a string representing a readme content section header.
   * @param query - a {@link Query} object
   * @param strict - a boolean flag to enable strict string matching.
   *
   * @returns - a boolean indicating whether a specific header was found in the readme content.
   */
  public static headerFound(header: string, query: Query, strict = false): boolean {
    if (typeof query === 'string') {
      if (strict) {
        return header === query;
      }
      return header.includes(query);
    }
    if (query instanceof RegExp && query.test(header)) {
      return true;
    }

    return false;
  }

  /*
   * @param textParts - a list of strings that are used to build a table of contents entry that links to a content section
   *
   * @returns a string representing a markdown anchor tag to a link in the same document.
   */
  public static makeLink = (...textParts: string[]): string => {
    return `[${textParts.join(' ')}](#${Readme.sanitize(textParts.join('-')).toLowerCase()})`;
  };

  /*
   * Generates a content block with an NS8 proprietary license.
   * @param heading - type of heading to use for the license block.
   * @returns a {@link ReadmeBlock}
   */
  public static getLicenseBlock(header = '##'): ReadmeBlock {
    return new ReadmeBlock({
      header: `${header} License`,
      content: 'See [License](./LICENSE)\n\n© [ns8inc](https://ns8.com)\n',
    });
  }

  /*
   * @param content - a string representing an unparsed section
   * @returns a parsed readme section as a {@link ReadmeBlock}
   */
  static parseBlockFromContent(content: string): ReadmeBlock {
    const blocks: ReadmeBlock[] = Readme.parse(content);
    // skip first block, the internal _root node
    return blocks[1];
  }

  /*
   * readme content
   */
  content = '';

  /*
   * A list of {@link Content} or {@link Code} blocks.
   */
  blocks: ReadmeBlock[] = [];

  /*
   * A map of {@link Content} blocks.
   */
  indexedBlocks: IndexedBlocks = new Map();

  /*
   * @param content - readme content as a string.
   */
  constructor(content = '') {
    this.blocks = Readme.parse(content.trim());
    this.index();
  }

  /*
   * @param content - readme content as string, to be parsed into {@link ReadmeBlock}s.
   * Parses the readme content and returns a Readme instance for chaining.
   *
   * @returns a {@link Readme} instance.
   */

  public static parse(content = ''): ReadmeBlock[] {
    const lines = content.split('\n').filter(Boolean);
    const blocks: ReadmeBlock[] = [];

    const rootBlock = new ReadmeBlock({
      header: '_root',
      content: '',
    });

    blocks.push(rootBlock);
    let inCodeBlock = false;

    // basic state machine to detect, line-by-line, which part of the readme
    for (const line of lines) {
      // in code block, don't parse header tags as new content blocks
      if (inCodeBlock) {
        if (Readme.isCodeEndTag(line)) {
          inCodeBlock = false;
        }
        blocks[blocks.length - 1].content += `${line}\n`;
      } else {
        // in regular content block

        if (Readme.isHeader(line)) {
          const newBlock = new ReadmeBlock({
            header: line,
            content: '',
          });
          blocks.push(newBlock);
        } else {
          if (Readme.isCodeStartTag(line)) {
            inCodeBlock = true;
          }
          // regular content line
          blocks[blocks.length - 1].content += `${line}\n`;
        }
      }
    }

    return blocks;
  }

  /*
   * Indexes {@link Block}s by header to support efficient querying.
   */

  public index(): void {
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
   * @param startAt - the index of blocks to start parsing for the table of contents
   * @param indent - a string used to pad indentations for the list indentations.
   *
   * @returns a table of contents in string form.
   */
  public getTocBlock(startAt = 1, indent = '  '): ReadmeBlock {
    if (startAt < 0) {
      throw new Error(`Table of Contents insertionPoint invalid: ${startAt}`);
    }

    const content = this.blocks
      .slice(startAt + 1) // +1 to skip _root block and the readme top-level header
      .filter(({ header }) => !header.includes('Table of Contents'))
      .map(({ header }) => {
        const [marker, ...text] = header.trim().split(' ');
        const indentCount = marker.length - 1;
        const linkedHeader = Readme.makeLink(...text);
        return `${Readme.repeat(indent, indentCount)}- ${linkedHeader}`;
      })
      .join('\n');

    return new ReadmeBlock({ header: '## Table of Contents', content });
  }

  /*
   * Convert the internal readme representation back to a string.
   *
   * @returns a string representing the entire readme after any transformations.
   */
  public export(): string {
    let output = '';

    for (const block of this.blocks) {
      if (!Readme.isRootNode(block)) {
        output += `${block.header.trim()}\n\n`;
      }
      output += `${block.content.trimRight()}\n\n`;
    }

    const justRootBlock = this.blocks.length === 1;
    const ret = justRootBlock ? this.blocks[0].content : `${output.trim()}\n`;
    return format(ret, { parser: 'markdown' });
  }

  /* Implements toString method so that the readme is coerced properly
   * when stringified.
   *
   * @returns a string representing the entire readme, post any transformations.
   */
  public toString(): string {
    return this.export();
  }

  /*
   * Get a content parsed block by index.
   *
   * @param index - index of block in list of parsed content blocks.
   *
   * @returns a {@link Block} at the supplied index.  If the index is out of range, it throws an error.
   */
  getSectionAt(index: number): ReadmeBlock {
    if (index < 0 || index > this.blocks.length) {
      throw new Error(`Index out of range: ${index}`);
    }
    return this.blocks[index];
  }

  /*
   * Find a single content (non-code) block by header.
   *
   * @param content - a {@link Block} object to insert before a matched content header.
   * @param strict - whether to perform a strict string match or not against a content header.
   *
   * @returns a single {@link Block } object if a section is matched, or null.
   */
  getSection(target: Query, strict = false): ReadmeBlock | null {
    return this.getSections(target, strict)[0] || null;
  }

  /*
   * Find content blocks by header.
   *
   * @param content - a {@link Block} object to insert before a matched content header.
   * @param strict - whether to perform a strict string match or not against a content header.
   *
   * @returns a list of matched content {@link Block}s.
   */
  getSections(target: Query, strict = false): ReadmeBlock[] {
    const blocks: ReadmeBlock[] = [];

    if (typeof target === 'string') {
      for (const [key, contentBlocks] of this.indexedBlocks.entries()) {
        if ((strict && key === target) || key.includes(target)) {
          blocks.push(...contentBlocks);
        }
      }
    } else {
      for (const [key, contentBlocks] of this.indexedBlocks.entries()) {
        if (target.test(key)) {
          blocks.push(...contentBlocks);
        }
      }
    }

    return blocks;
  }

  /*
  /*
   * Parses content and adds it as a block to the end of the readme.
   * @param content - a string representing an unparsed readme section
   */
  appendContent(content: string): void {
    const parsedBlock: ReadmeBlock = Readme.parseBlockFromContent(content);
    this.blocks.push(parsedBlock);
    this.index();
  }

  /*
   * Parses content and adds it as a block to the beginning of the readme.
   * @param content - a string representing an unparsed readme section
   */
  prependContent(content: string): void {
    const parsedBlock: ReadmeBlock = Readme.parseBlockFromContent(content);
    this.blocks.splice(1, 0, parsedBlock);
    this.index();
  }

  /*
   * Appends content at end of the readme content list.
   *
   * @param block - a {@link Block} object to insert before a matched content header.
   * @param target - optional target block to append the new block after.
   */
  appendBlock(block: ReadmeBlock, target: ReadmeBlock | null = null): void {
    if (target) {
      const targetIndex = this.blocks.findIndex((b) => b === target);
      if (targetIndex >= 0) {
        this.blocks.splice(targetIndex + 1, 0, block);
        this.index();
      }
    } else {
      this.blocks.push(block);
      this.index();
    }
  }

  /*
   * Prepends content to the beginning of the readme content list.
   *
   * @param block - a {@link Block} object to insert before a matched content header.
   * @param target - optional target block to prepend the new block before.
   */
  prependBlock(block: ReadmeBlock, target: ReadmeBlock | null = null): void {
    if (target) {
      const targetIndex = this.blocks.findIndex((b) => b === target);
      if (targetIndex >= 0) {
        this.blocks.splice(targetIndex, 0, block);
        this.index();
      }
    } else {
      this.blocks.splice(1, 0, block);
      this.index();
    }
  }

  /*
   * Inserts the content after a matching content block.
   *
   * @param target - a {@link Query} object to match a content section.
   * @param content - a {@link Block} object to insert after a matched content header.
   * @param strict - boolean indicating whether to perform a strict match or not against a content header.
   */
  insertAfter(target: Query, newBlock: ReadmeBlock, strict = false): void {
    const index = this.blocks.findIndex((block) => {
      return Readme.headerFound(block.header, target, strict);
    });

    if (index > -1) {
      this.blocks.splice(index + 1, 0, newBlock);
    }

    this.index();
  }

  /*
   * Inserts the content after a matching content block.
   *
   * @param target - a {@link Query} object to match a content section.
   * @param content - a {@link Block} object to insert before a matched content header.
   * @param strict - whether to perform a strict string match or not against a content header.
   */
  insertBefore(target: Query, newBlock: ReadmeBlock, strict = false): void {
    const index = this.blocks.findIndex((block) => {
      return Readme.headerFound(block.header, target, strict);
    });

    if (index > -1) {
      this.blocks.splice(index, 0, newBlock);
    }

    this.index();
  }

  /*
   * Set the first found section (targeted by string/regex) to the supplied content
   *
   * @param target - a {@link Query} object to match a content section for replacement.
   * @param content - a {@link Block} object to insert after a matched content header.
   */
  setSection(target: Query, content: string): void {
    const sections: ReadmeBlock[] = this.getSections(target);

    if (sections.length > 0) {
      sections[0].content = content;
      this.index();
    }
  }

  /*
   * Set the section content at the supplied index. If the index is out of range, throw an error.
   *
   * @param index - index at which to set a section's content.
   * @param content - a {@link Block} object to insert after a matched content header.
   */
  setSectionAt(index: number, content: string): void {
    const internalIndex = index + 1; // includes the first (internal) '_root' block
    if (internalIndex >= 1 && internalIndex <= this.blocks.length - 1) {
      const targetBlock = this.blocks[internalIndex];
      targetBlock.content = content;
      this.index();
    } else {
      throw new Error(`Index out of range: ${index}`);
    }
  }
}
