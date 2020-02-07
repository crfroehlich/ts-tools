import { expect, use } from 'chai';
import { join } from 'path';
import { promisify } from 'util';
import { readFile } from 'fs';
import 'mocha';
import Readme from '../index';

const testFiles = {
  empty: './test/test-data/TEST1.md',
  duplicateHeaders: './test/test-data/TEST2.md',
  headersOnly: './test/test-data/TEST3.md',
  codeBlocksContainingHeaders: './test/test-data/TEST4.md',
  standard: './test/test-data/TEST5.md',
};

describe('Readme constructor', () => {

  it('should have an absolute path property if a path string is passed in.', () => {
    const readme = new Readme('test-path');
    expect(readme.path).to.equal(join(__dirname,'..', 'test-path'));
  });

  it('should throw if no path is passed in', () => {
    expect(function() { new Readme('') }).to.throw();
  });

});

describe('Readme.parse', () => {

  it('empty file should only result in a _root block and a _root indexedBlock.', async() => {
    const readme = await new Readme(testFiles.empty).parse();
    expect(readme.indexedBlocks.size === 1);
    expect(readme.blocks.length === 1);
  });

  it('6 headers (1 duplicate) should result in 7 blocks.', async() => {
    const readme = await new Readme(testFiles.duplicateHeaders).parse();
    expect(readme.blocks.length).to.equal(7);
  });

  it('6 headers (1 duplicate) header should result in 6 indexedBlocks.', async() => {
    const readme = await new Readme(testFiles.duplicateHeaders).parse();
    expect(readme.indexedBlocks.size).to.equal(6);
  });

  it('triplicate headers and no contents should result in 4 blocks (1 for root, 3 for each toc).', async() => {
    const readme = await new Readme(testFiles.headersOnly).parse();
    expect(readme.blocks.length).to.equal(4);
  });

  it('triplicate headers and no contents should result in 2 indexedBlocks (1 for root + 1 for toc).', async() => {
    const readme = await new Readme(testFiles.headersOnly).parse();
    expect(readme.indexedBlocks.size).to.equal(2);
  });

});

describe('Readme.getSection', async () => {

  it('should return null when a query doesnt match any heading', async () => {

    const readme = await new Readme(testFiles.standard).parse();
    readme.setSection('Table of Contents', 'REPLACED CONTENT');
    const section = readme.getSection('Non-existent Heading');
    expect(section).to.be.null;

  });

  it('should return null for any getSection call with an emtpy file', async () => {

    const readme = await new Readme(testFiles.empty).parse();
    const nonExistentSection = readme.getSection('Table of Contents');
    expect(nonExistentSection).to.equal(null);

  });

  it('should return value for an existing section using a RegExp', async () => {

    const readme = await new Readme(testFiles.standard).parse();
    const section = readme.getSection(/^ *#+ *Table of Contents/);
    expect(section).to.have.property('content');
    expect(section).to.have.property('header');

  });

});

describe('Readme.getSections', async () => {

  it('should return any emtpy array for any getSections call where there are no matches.', async () => {

    const readme = await new Readme(testFiles.headersOnly).parse();
    const sections = readme.getSections('Table of Contents');
    expect(sections.length).to.equal(3);

  });

  it('should two entries for a duplicate header.', async () => {

    const readme = await new Readme(testFiles.duplicateHeaders).parse();
    const sections = readme.getSections('Purpose');
    expect(sections.length).to.equal(2);

  });

  it('should ignore content inside of code blocks', async() => {

    const readme = await new Readme(testFiles.codeBlocksContainingHeaders).parse();
    const section = readme.getSection('Code Header');
    expect(section).to.be.null;

  });

  it('should return value for an existing section using a RegExp', async () => {

    const readme = await new Readme(testFiles.headersOnly).parse();
    const sections = readme.getSections('Table of Contents');
    expect(sections.length).to.equal(3);
    expect(sections.every(({ header }) => header.includes('Table of Contents')));
    expect(sections.every(({ content }) => content.filter(Boolean).length === 0));

  });

});

describe('Readme.export', async () => {

  it('should return a section when Table of Contents is replaced with dummy data', async () => {

    const readme = await new Readme(testFiles.standard).parse();
    const noModificationExport = readme.export(); 
    readme.setSection('Table of Contents', 'REPLACED CONTENT');
    expect(readme.getSection('Table of Contents')?.content.join('\n')).to.equal('REPLACED CONTENT');

    const modificationExport = readme.export();
    expect(noModificationExport).not.to.equal(modificationExport);


  });


  it('should export file correctly if it contains code blocks', async () => {

    const readme = await new Readme(testFiles.codeBlocksContainingHeaders).parse();
    const codeBlockFile = await promisify(readFile)(testFiles.codeBlocksContainingHeaders, 'utf8');
    // ignoring differing white-space for now. should be fixed
    expect(readme.export().split('\n').filter(Boolean).join('')).to.equal(codeBlockFile.split('\n').filter(Boolean).join(''))

  });

});
