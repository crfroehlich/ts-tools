/* eslint-disable no-restricted-syntax */
import { Block, IndexedBlocks, Query } from './types';

interface TocArgs {
  insertionPoint: Query | number;
  indent: string;
}
/**
 * The Readme class represents a markdown README and provides an API for programmatic transformations of it.
 */

export class Readme {
  public static isHeader = (line: string): boolean => /^ *#+ /.test(line);

  public static isCodeStartTag = (line: string): boolean => /^ *```[^`]*$/.test(line);

  public static isCodeEndTag = (line: string): boolean => /^ *``` *$/.test(line);

  public static isRootNode = (block: Block): boolean => block.header === '_root';

  public static sanitize = (line: string): string => line.replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, ''); // ascii-centric

  public static repeat = (s: string, count: number): string => [...Array(count).keys()].map(() => s).join('');

  public static makeLink = (...textParts: string[]): string => {
    return `[${textParts.join(' ')}](#${Readme.sanitize(textParts.join('-')).toLowerCase()})`;
  };

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
   * pass readme content in as a string.
   */
  content = '';

  /*
   * A list of {@link Content} or {@link Code} blocks.
   */
  blocks: Block[] = [];

  /*
   * A map of {@link Content} blocks.
   */
  indexedBlocks: IndexedBlocks = new Map();

  /*
   * @param content - readme content as a string.
   */
  constructor(content = '') {
    this.content = content;
  }

  /*
   * Parses the readme content and returns it as Promise-wrapped Readme instance for chaining.
   *
   * @returns a {@link Readme} instance.
   */

  parse(): Readme {
    const lines = this.content.split('\n');

    const rootBlock: Block = {
      header: '_root',
      content: [],
    };

    this.blocks.push(rootBlock);
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

        /* eslint-disable no-lonely-if */
        if (Readme.isHeader(line)) {
          const newBlock = {
            header: line,
            content: [],
          };
          this.blocks.push(newBlock);
          // TODO: maybe index previous block on the fly here?
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
   * This does not replace an existing ToC.
   */
  toc(startAt = 1, indent = '  '): string {
    const tocHeader = '## Table of Contents\n';
    if (startAt < 0) {
      throw new Error(`ToC insertionPoint invalid: ${startAt}`);
    }

    const toc = this.blocks
      .slice(startAt + 1) // +1 to skip _root block and the readme top-level header
      .map(({ header }) => {
        const [marker, ...text] = header.trim().split(' ');
        const indentCount = marker.length - 1;
        const linkedHeader = Readme.makeLink(...text);
        return `${Readme.repeat(indent, indentCount)}+ ${linkedHeader}`;
      })
      .join('\n');

    return `${tocHeader}${toc}`;
  }

  /*
   *
   * Renders the parsed readme {@link Block} list as a string.
   *
   */
  export(): string {
    let output = '';

    for (const block of this.blocks) {
      if (!Readme.isRootNode(block)) {
        output += `${block.header}\n`;
      }
      output += `${block.content.join('\n')}\n`;
    }

    return output;
  }

  getSectionAt(index: number): Block {
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
   */
  getSection(target: Query, strict = false): Block | null {
    return this.getSections(target, strict)[0] || null;
  }

  /*
   * Find content (non-code) blocks by header.
   *
   * @param content - a {@link Block} object to insert before a matched content header.
   * @param strict - whether to perform a strict string match or not against a content header.
   */
  getSections(target: Query, strict = false): Block[] {
    const blocks = [];

    if (typeof target === 'string') {
      for (const [key, contentBlocks] of this.indexedBlocks.entries()) {
        if (strict) {
          if (key === target) {
            blocks.push(...contentBlocks);
          }
        } else if (key.includes(target)) {
          blocks.push(...contentBlocks);
        }
      }
    }
    else {
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
  prepend(content: Block): void {
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

  append(content: Block): void {
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
  insertAfter(target: Query, content: Block, strict = false): void {
    const index = this.blocks.findIndex((block) => {
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
  insertBefore(target: Query, content: Block, strict = false): void {
    const index = this.blocks.findIndex((block) => {
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
  setSection(target: Query, content: string): void {
    const sections: Block[] = this.getSections(target);

    if (sections.length > 0) {
      sections[0].content = content.split('\n');
      this.index();
    }
  }

  setSectionAt(index: number, content: string): void {
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
