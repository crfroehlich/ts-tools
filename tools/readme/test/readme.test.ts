import { expect, use } from 'chai';
import { join, resolve } from 'path';
import { promisify } from 'util';
import { readFile } from 'fs';
import 'mocha';
import Readme from '../src/readme';

const TEST_FILES = {
  EMPTY: join(__dirname, 'test-data/empty.md'),
  DUPLICATE_HEADERS: join(__dirname, 'test-data/duplicateHeaders.md'),
  HEADERS_ONLY: join(__dirname, 'test-data/headersOnly.md'),
  CODE_BLOCKS_CONTAINING_HEADERS: join(__dirname, 'test-data/codeBlocksWithHeaders.md'),
  STANDARD: join(__dirname, 'test-data/standard.md'),
  MISSING_TOC: join(__dirname, 'test-data/missingToc.md'),
};

describe('Readme constructor', () => {

  it('should throw if an invalid path is passed in', () => {

    expect(function() { new Readme('') }).to.throw();

  });

  it('should resolve and store a path parameter relative to the caller\'s cwd.', () => {

    const dotSlash = './';
    const dot = '.';
    const cwd = process.cwd();

    expect(new Readme(dot).path).to.equal(cwd);
    expect(new Readme(dotSlash).path).to.equal(cwd);
    expect(new Readme('test-path').path).to.equal(join(cwd, 'test-path'));

  })


});

describe('Readme.parse', () => {

  it('empty file should only result in a _root block and a _root indexedBlock.', async() => {
    const readme = await new Readme(TEST_FILES.EMPTY).parse();
    expect(readme.indexedBlocks.size === 1);
    expect(readme.blocks.length === 1);
  });

  it('6 headers (1 duplicate) should result in 7 blocks.', async() => {
    const readme = await new Readme(TEST_FILES.DUPLICATE_HEADERS).parse();
    expect(readme.blocks.length).to.equal(7);
  });

  it('6 headers (1 duplicate) header should result in 6 indexedBlocks.', async() => {
    const readme = await new Readme(TEST_FILES.DUPLICATE_HEADERS).parse();
    expect(readme.indexedBlocks.size).to.equal(6);
  });

  it('triplicate headers and no contents should result in 4 blocks (1 for root, 3 for each toc).', async() => {
    const readme = await new Readme(TEST_FILES.HEADERS_ONLY).parse();
    expect(readme.blocks.length).to.equal(4);
  });

  it('triplicate headers and no contents should result in 2 indexedBlocks (1 for root + 1 for toc).', async() => {
    const readme = await new Readme(TEST_FILES.HEADERS_ONLY).parse();
    expect(readme.indexedBlocks.size).to.equal(2);
  });

});

describe('Readme.getSection', async () => {

  it('should return null when a query doesnt match any heading', async () => {

    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    readme.setSection('Table of Contents', 'REPLACED CONTENT');
    const section = readme.getSection('Non-existent Heading');
    expect(section).to.be.null;

  });

  it('should return null for any getSection call with an emtpy file', async () => {

    const readme = await new Readme(TEST_FILES.EMPTY).parse();
    const nonExistentSection = readme.getSection('Table of Contents');
    expect(nonExistentSection).to.equal(null);

  });

  it('should return value for an existing section using a RegExp', async () => {

    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    const section = readme.getSection(/^ *#+ *Table of Contents/);
    expect(section).to.have.property('content');
    expect(section).to.have.property('header');

  });

});

describe('Readme.getSections', async () => {

  it('should return any emtpy array for any getSections call where there are no matches.', async () => {

    const readme = await new Readme(TEST_FILES.HEADERS_ONLY).parse();
    const sections = readme.getSections('Table of Contents');
    expect(sections.length).to.equal(3);

  });

  it('should two entries for a duplicate header.', async () => {

    const readme = await new Readme(TEST_FILES.DUPLICATE_HEADERS).parse();
    const sections = readme.getSections('Purpose');
    expect(sections.length).to.equal(2);

  });

  it('should ignore content inside of code blocks', async() => {

    const readme = await new Readme(TEST_FILES.CODE_BLOCKS_CONTAINING_HEADERS).parse();
    const section = readme.getSection('Code Header');
    expect(section).to.be.null;

  });

  it('should return value for an existing section using a RegExp', async () => {

    const readme = await new Readme(TEST_FILES.HEADERS_ONLY).parse();
    const sections = readme.getSections('Table of Contents');
    expect(sections.length).to.equal(3);
    expect(sections.every(({ header }) => header.includes('Table of Contents')));
    expect(sections.every(({ content }) => content.filter(Boolean).length === 0));

  });

});

describe('Readme.export', async () => {

  it('should return a section when Table of Contents is replaced with dummy data', async () => {

    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    const noModificationExport = readme.export(); 
    readme.setSection('Table of Contents', 'REPLACED CONTENT');
    expect(readme.getSection('Table of Contents')?.content.join('\n')).to.equal('REPLACED CONTENT');

    const modificationExport = readme.export();
    expect(noModificationExport).not.to.equal(modificationExport);


  });


  it('should export file correctly if it contains code blocks', async () => {

    const readme = await new Readme(TEST_FILES.CODE_BLOCKS_CONTAINING_HEADERS).parse();
    const codeBlockFile = await promisify(readFile)(TEST_FILES.CODE_BLOCKS_CONTAINING_HEADERS, 'utf8');

    // TODO: ignores differing white-space for now. fix.
    expect(
      readme.export()
        .split('\n')
        .filter(Boolean)
        .join('')
    ).to.equal(
      codeBlockFile
        .split('\n')
        .filter(Boolean)
        .join('')
    )

  });

});

describe('table of contents', async() => {

  it('should generate a toc', async () => {


    const expectedToc = `+ [Demo Repo](#demo-repo)
  + [Header with a \`tag in it\`](#header-with-a-tag-in-it)
  + [Sub-purpose section](#sub-purpose-section)
    + [Sub-sub purpose section](#sub-sub-purpose-section)
      + [\`yarn\` scripts](#yarn-scripts)
+ [Authors](#authors)
+ [Contributing](#contributing)
+ [License](#license)`;

    const readme = await new Readme(TEST_FILES.MISSING_TOC).parse();
    const toc = readme.toc();
    expect(toc).to.equal(expectedToc);

  });

})
