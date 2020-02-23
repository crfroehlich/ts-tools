/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { join } from 'path';
import { promisify } from 'util';
import { readFile } from 'fs';
import 'mocha';
import Readme from './readme';

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
    expect(() => {
      const readme = new Readme('');
      readme.parse().then((rdme) => {
        return rdme.blocks.length;
      });
    }).to.throw();
  });

  it('should resolve and store a path parameter relative to the calling cwd.', () => {
    const dotSlash = './';
    const dot = '.';
    const cwd = process.cwd();

    expect(new Readme(dot).path).to.equal(cwd);
    expect(new Readme(dotSlash).path).to.equal(cwd);
    expect(new Readme('test-path').path).to.equal(join(cwd, 'test-path'));
  });
});

describe('Readme.parse', () => {
  it('empty file should only result in a _root block and a _root indexedBlock.', async () => {
    const readme = await new Readme(TEST_FILES.EMPTY).parse();
    expect(readme.indexedBlocks.size === 1);
    expect(readme.blocks.length === 1);
  });

  it('6 headers (1 duplicate) should result in 7 blocks.', async () => {
    const readme = await new Readme(TEST_FILES.DUPLICATE_HEADERS).parse();
    expect(readme.blocks.length).to.equal(7);
  });

  it('6 headers (1 duplicate) header should result in 6 indexedBlocks.', async () => {
    const readme = await new Readme(TEST_FILES.DUPLICATE_HEADERS).parse();
    expect(readme.indexedBlocks.size).to.equal(6);
  });

  it('triplicate headers and no contents should result in 4 blocks (1 for root, 3 for each toc).', async () => {
    const readme = await new Readme(TEST_FILES.HEADERS_ONLY).parse();
    expect(readme.blocks.length).to.equal(4);
  });

  it('triplicate headers and no contents should result in 2 indexedBlocks (1 for root + 1 for toc).', async () => {
    const readme = await new Readme(TEST_FILES.HEADERS_ONLY).parse();
    expect(readme.indexedBlocks.size).to.equal(2);
  });
});

describe('Readme.getSection', async () => {
  it('should return null when a query doesnt match any heading', async () => {
    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    readme.setSection('Table of Contents', 'REPLACED CONTENT');
    expect(readme.getSection('Non-existent Heading')).to.be.null;
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

  it('should ignore content inside of code blocks', async () => {
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
      readme
        .export()
        .split('\n')
        .filter(Boolean)
        .join(''),
    ).to.equal(
      codeBlockFile
        .split('\n')
        .filter(Boolean)
        .join(''),
    );
  });
});

describe('table of contents', async () => {
  it('should generate a toc', async () => {
    const expectedToc = `## Table of Contents
  + [Header with a \`tag in it\`](#header-with-a-tag-in-it)
  + [Sub-purpose section](#sub-purpose-section)
    + [Sub-sub purpose section](#sub-sub-purpose-section)
      + [\`yarn\` scripts](#yarn-scripts)
+ [Authors](#authors)
+ [Contributing](#contributing)
+ [License](#license)
`;

    const readme = await new Readme(TEST_FILES.MISSING_TOC).parse();
    const toc = readme.toc();
    expect(toc).to.equal(expectedToc);
  });
});

describe('insertBefore', async () => {
  it('should add a block before the matched content block, when the query target is a valid match', async () => {
    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    const previousLength = readme.blocks.length;
    const newBlock = {
      header: '## Insert Before',
      content: ['Newly Inserted block content', ''],
    };
    readme.insertBefore('# Purpose', newBlock);
    expect(readme.blocks.length).to.equal(previousLength + 1);

    const foundIndex = readme.blocks.findIndex((block) => {
      return Readme.headerFound(block.header, '# Purpose');
    });
    expect(foundIndex).to.be.greaterThan(0);
    const blockBeforeTarget = readme.blocks[foundIndex - 1];
    expect(blockBeforeTarget.header).to.equal('## Insert Before');

    const foundBlock = readme.blocks.find((block) => {
      return Readme.headerFound(block.header, '## Insert Before');
    });
    expect(foundBlock).not.to.be.undefined;
    expect(foundBlock).to.have.property('header');
    expect(foundBlock).to.have.property('content');
    expect(foundBlock)
      .property('content')
      .to.deep.equal(['Newly Inserted block content', '']);
  });

  it('should not add a block before the matched content block, when the query target is an invalid match', async () => {
    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    const block = {
      header: '## Insert Before',
      content: ['Newly Inserted block content', ''],
    };

    const previousLength = readme.blocks.length;
    readme.insertBefore('# Non-existent Section', block);
    expect(readme.blocks.length).to.equal(previousLength);

    const foundBlock = readme.blocks.find(({ header }) => {
      return Readme.headerFound(header, '## Insert Before');
    });
    expect(foundBlock).to.be.undefined;
  });
});

describe('insertAfter', async () => {
  it('should add a block before the matched content block, when the query target is a valid match', async () => {
    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    const previousLength = readme.blocks.length;
    const newBlock = {
      header: '## Insert After',
      content: ['Newly Inserted block content', ''],
    };
    readme.insertAfter('# Purpose', newBlock);
    expect(readme.blocks.length).to.equal(previousLength + 1);

    const foundBlock = readme.blocks.find((block) => {
      return Readme.headerFound(block.header, '## Insert After');
    });

    const foundIndex = readme.blocks.findIndex((block) => {
      return Readme.headerFound(block.header, '# Purpose');
    });
    expect(foundIndex).to.be.greaterThan(0);
    const blockAfterTarget = readme.blocks[foundIndex + 1];
    expect(blockAfterTarget.header).to.equal('## Insert After');

    expect(foundBlock).not.to.be.undefined;
    expect(foundBlock).to.have.property('header');
    expect(foundBlock).to.have.property('content');
    expect(foundBlock)
      .property('content')
      .to.deep.equal(['Newly Inserted block content', '']);
  });

  it('should not add a block before the matched content block, when the query target is an invalid match', async () => {
    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    const block = {
      header: '## Insert Before',
      content: ['Newly Inserted block content', ''],
    };

    const previousLength = readme.blocks.length;
    readme.insertBefore('# Non-existent Section', block);
    expect(readme.blocks.length).to.equal(previousLength);

    const foundBlock = readme.blocks.find(({ header }) => {
      return Readme.headerFound(header, '## Insert Before');
    });
    expect(foundBlock).to.be.undefined;
  });
});

describe('append', async () => {
  it('should append new block to end of blocks', async () => {
    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    const initialBlockCount = readme.blocks.length;
    const block = {
      header: '## Append',
      content: ['Appended Content', ''],
    };
    readme.append(block);
    const finalBlock = readme.blocks[readme.blocks.length - 1];

    expect(readme.blocks.length).to.equal(initialBlockCount + 1);
    expect(finalBlock.header).to.deep.equal('## Append');
    expect(finalBlock.content).to.deep.equal(['Appended Content', '']);
  });
  // TODO: test indexing by searching via Query
});

describe('prepend', async () => {
  it('should prepend new block to readme content blocks', async () => {
    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    const initialBlockCount = readme.blocks.length;
    const block = {
      header: '## Prepend',
      content: ['Prepended Content', ''],
    };
    readme.prepend(block);
    const firstBlock = readme.blocks[0];

    expect(readme.blocks.length).to.equal(initialBlockCount + 1);
    expect(firstBlock.header).to.deep.equal('## Prepend');
    expect(firstBlock.content).to.deep.equal(['Prepended Content', '']);

    // TODO: test indexing by searching via Query
  });
});

describe('setSection', async () => {
  it('should replace content for a section by index', async () => {
    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    const privateLicenseBlockIndex = 5; // index includes + 1 for _root block, whereas setSectionAt doesn't.

    readme.setSection('License', 'MIT License');
    expect(readme.blocks[privateLicenseBlockIndex].content[0]).to.equal('MIT License');

    readme.setSection(/^## License/, 'NS8 Proprietary 1.0 License');
    expect(readme.blocks[privateLicenseBlockIndex].content[0]).to.equal('NS8 Proprietary 1.0 License');

    const updatedSection = readme.getSection(/^## License/);
    expect(updatedSection).not.to.be.null;
    expect(updatedSection?.content[0]).to.equal('NS8 Proprietary 1.0 License');
  });
});

describe('setSectionAt', async () => {
  it('should replace content for a section by index', async () => {
    const readme = await new Readme(TEST_FILES.STANDARD).parse();
    const licenseBlockIndexPublic = 4;
    const preUpdateLicense = 'This project is licensed with an NS8 1.0 proprietary license.';
    const postUpdateLicense = 'MIT License';

    expect(readme.getSection(/^## License/)?.content[0]).to.equal(preUpdateLicense);
    readme.setSectionAt(licenseBlockIndexPublic, postUpdateLicense);
    expect(readme.getSection(/^## License/)?.content[0]).to.equal(postUpdateLicense);
  });
});
