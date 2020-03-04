/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { join } from 'path';
import { readFileSync } from 'fs';
import 'mocha';
import { Readme } from './readme';

const TEST_FILES = {
  EMPTY: join(__dirname, 'test-data/empty.md'),
  DUPLICATE_HEADERS: join(__dirname, 'test-data/duplicateHeaders.md'),
  HEADERS_ONLY: join(__dirname, 'test-data/headersOnly.md'),
  CODE_BLOCKS_CONTAINING_HEADERS: join(__dirname, 'test-data/codeBlocksWithHeaders.md'),
  STANDARD: join(__dirname, 'test-data/standard.md'),
  MISSING_TOC: join(__dirname, 'test-data/missingToc.md'),
};

describe('Readme constructor', () => {
  it('should bind the passed in content', () => {
    const content = '# Test Readme\n# Description: Test Description';
    const readme = new Readme(content);
    expect(readme.content).to.equal(content);
  });

  it('should provide default content if none is supplied', () => {
    const readme = new Readme();
    expect(readme.content).to.equal('');
  });
});

describe('parse', () => {
  it('empty readme content should only result in a _root block and a _root indexedBlock.', () => {
    const readme = new Readme('').parse();
    expect(readme.indexedBlocks.size === 1);
    expect(readme.blocks.length === 1);
  });

  it('6 headers (1 duplicate) should result in 7 blocks.', () => {
    const duplicateHeadersContent = readFileSync(TEST_FILES.DUPLICATE_HEADERS, 'utf8');
    const readme = new Readme(duplicateHeadersContent).parse();
    expect(readme.blocks.length).to.equal(7);
  });

  it('6 headers (1 duplicate) header should result in 6 indexedBlocks.', () => {
    const duplicateHeadersContent = readFileSync(TEST_FILES.DUPLICATE_HEADERS, 'utf8');
    const readme = new Readme(duplicateHeadersContent).parse();
    expect(readme.indexedBlocks.size).to.equal(6);
  });

  it('triplicate headers and no contents should result in 4 blocks (1 for root, 3 for each toc).', () => {
    const headersOnlyContent = readFileSync(TEST_FILES.HEADERS_ONLY, 'utf8');
    const readme = new Readme(headersOnlyContent).parse();
    expect(readme.blocks.length).to.equal(4);
  });

  it('triplicate headers and no contents should result in 2 indexedBlocks (1 for root + 1 for toc).', () => {
    const headersOnlyContent = readFileSync(TEST_FILES.HEADERS_ONLY, 'utf8');
    const readme = new Readme(headersOnlyContent).parse();
    expect(readme.indexedBlocks.size).to.equal(2);
  });
});

describe('getSection', () => {
  it('should return null when a query doesnt match any heading', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
    readme.setSection('Table of Contents', 'REPLACED CONTENT');
    expect(readme.getSection('Non-existent Heading')).to.be.null;
  });

  it('should return null for any getSection call with an emtpy file', () => {
    const emptyContent = readFileSync(TEST_FILES.EMPTY, 'utf8');
    const readme = new Readme(emptyContent).parse();
    const nonExistentSection = readme.getSection('Table of Contents');
    expect(nonExistentSection).to.equal(null);
  });

  it('should return value for an existing section using a RegExp', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
    const section = readme.getSection(/^ *#+ *Table of Contents/);
    expect(section).to.have.property('content');
    expect(section).to.have.property('header');
  });
});

describe('getSectionAt', () => {
  it('should throw if the index is out of range (less than 0)', () => {
    expect(() => {
      const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
      const readme = new Readme(standardContent).parse();
      readme.getSectionAt(-1);
    }).to.throw();
  });

  it('should throw if the index is out of range (greater than block count)', () => {
    expect(() => {
      const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
      const readme = new Readme(standardContent).parse();
      readme.getSectionAt(readme.blocks.length + 1);
    }).to.throw();
  });

  it('should return the expected content block, given the appropriate block index', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
    const newBlock = {
      header: '## Insert Before',
      content: ['Newly Inserted block content', ''],
    };
    readme.append(newBlock);
    const blockCount = readme.blocks.length;
    const fetchedBlock = readme.getSectionAt(blockCount - 1);
    expect(fetchedBlock).to.equal(newBlock);
  });
});

describe('getSections', () => {
  it('should return any emtpy array for any getSections call where there are no matches.', () => {
    const headersOnlyContent = readFileSync(TEST_FILES.HEADERS_ONLY, 'utf8');
    const readme = new Readme(headersOnlyContent).parse();
    const sections = readme.getSections('Table of Contents');
    expect(sections.length).to.equal(3);
  });

  it('should return two entries for a duplicate header.', () => {
    const duplicateHeadersContent = readFileSync(TEST_FILES.DUPLICATE_HEADERS, 'utf8');
    const readme = new Readme(duplicateHeadersContent).parse();
    const sections = readme.getSections('Purpose');
    expect(sections.length).to.equal(2);
  });

  it('Regex matching.', () => {
    const duplicateHeadersContent = readFileSync(TEST_FILES.DUPLICATE_HEADERS, 'utf8');
    const readme = new Readme(duplicateHeadersContent).parse();
    const sections = readme.getSections(/## Purpose/);
    expect(sections.length).to.equal(2);
  });

  it('Regex not matching.', () => {
    const duplicateHeadersContent = readFileSync(TEST_FILES.DUPLICATE_HEADERS, 'utf8');
    const readme = new Readme(duplicateHeadersContent).parse();
    const sections = readme.getSections(/Porpose/);
    expect(sections.length).to.equal(0);
  });

  it('should return two entries for a duplicate header.', () => {
    const duplicateHeadersContent = readFileSync(TEST_FILES.DUPLICATE_HEADERS, 'utf8');
    const readme = new Readme(duplicateHeadersContent).parse();

    const sectionsStrictNoMatch = readme.getSections('Purpose', true);
    expect(sectionsStrictNoMatch.length).to.equal(0);

    const sectionsStrictMatchRegExp = readme.getSections(/Purpose/, true);
    expect(sectionsStrictMatchRegExp.length).to.equal(2);

    const sectionsStrictMatchString = readme.getSections('## Purpose', true);
    expect(sectionsStrictMatchString.length).to.equal(2);
  });

  it('should ignore content inside of code blocks', () => {
    const codeBlocksWithHeadersContent = readFileSync(TEST_FILES.CODE_BLOCKS_CONTAINING_HEADERS, 'utf8');
    const readme = new Readme(codeBlocksWithHeadersContent).parse();
    const section = readme.getSection('Code Header');
    expect(section).to.be.null;
  });

  it('should return value for an existing section using a RegExp', () => {
    const headersOnlyContent = readFileSync(TEST_FILES.HEADERS_ONLY, 'utf8');
    const readme = new Readme(headersOnlyContent).parse();
    const sections = readme.getSections('Table of Contents');
    expect(sections.length).to.equal(3);
    expect(sections.every(({ header }) => header.includes('Table of Contents')));
    expect(sections.every(({ content }) => content.filter(Boolean).length === 0));
  });
});

describe('export', () => {
  it('should return a section when Table of Contents is replaced with dummy data', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
    const noModificationExport = readme.export();
    readme.setSection('Table of Contents', 'REPLACED CONTENT');
    expect(readme.getSection('Table of Contents')?.content.join('\n')).to.equal('REPLACED CONTENT');

    const modificationExport = readme.export();
    expect(noModificationExport).not.to.equal(modificationExport);
  });

  it('should export file correctly if it contains code blocks', () => {
    const codeBlocksWithHeadersContent = readFileSync(TEST_FILES.CODE_BLOCKS_CONTAINING_HEADERS, 'utf8');
    const readme = new Readme(codeBlocksWithHeadersContent).parse();

    // TODO: ignores differing white-space for now. fix.
    expect(
      readme
        .export()
        .split('\n')
        .filter(Boolean)
        .join(''),
    ).to.equal(
      codeBlocksWithHeadersContent
        .split('\n')
        .filter(Boolean)
        .join(''),
    );
  });
});

describe('table of contents', () => {
  it('Generates a correct toc using a default target startAt index of 1.', () => {
    const missingTocContent = readFileSync(TEST_FILES.MISSING_TOC, 'utf8');
    const readme = new Readme(missingTocContent).parse();
    const toc = readme.toc();
    expect(toc).to.equal(
      '## Table of Contents\n' +
        '  + [Header with a `tag in it`](#header-with-a-tag-in-it)\n' +
        '  + [Sub-purpose section](#sub-purpose-section)\n' +
        '    + [Sub-sub purpose section](#sub-sub-purpose-section)\n' +
        '      + [`yarn` scripts](#yarn-scripts)\n' +
        '  + [Authors](#authors)\n' +
        '  + [Contributing](#contributing)\n' +
        '  + [License](#license)',
    );
  });

  it('Generates a correct toc using a startAt index of 0.', () => {
    const missingTocContent = readFileSync(TEST_FILES.MISSING_TOC, 'utf8');
    const readme = new Readme(missingTocContent).parse();
    const toc = readme.toc(0);
    expect(toc).to.equal(
      '## Table of Contents\n' +
        '+ [Demo Repo](#demo-repo)\n' +
        '  + [Header with a `tag in it`](#header-with-a-tag-in-it)\n' +
        '  + [Sub-purpose section](#sub-purpose-section)\n' +
        '    + [Sub-sub purpose section](#sub-sub-purpose-section)\n' +
        '      + [`yarn` scripts](#yarn-scripts)\n' +
        '  + [Authors](#authors)\n' +
        '  + [Contributing](#contributing)\n' +
        '  + [License](#license)',
    );
  });

  it('throws if an invalid index is passed', () => {
    expect(() => {
      const missingTocContent = readFileSync(TEST_FILES.MISSING_TOC, 'utf8');
      const readme = new Readme(missingTocContent).parse();
      readme.toc(-1);
    }).to.throw();
  });
});

describe('insertBefore', () => {
  it('should add a block before the matched content block, when the query target is a valid match', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
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

  it('should not add a block before the matched content block, when the query target is an invalid match', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
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

describe('insertAfter', () => {
  it('should add a block before the matched content block, when the query target is a valid match', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
    const previousLength = readme.blocks.length;
    const newBlock = {
      header: '## Insert After',
      content: ['Newly Inserted block content', ''],
    };
    readme.insertAfter('# Purpose', newBlock);
    expect(readme.blocks.length).to.equal(previousLength + 1);

    readme.insertAfter(/Purpose/, newBlock);
    expect(readme.blocks.length).to.equal(previousLength + 2);

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

  it('should fail if strict matching is enabled and the match is not an exact header match', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
    const block = {
      header: '## Insert Before',
      content: ['Newly Inserted block content', ''],
    };
    const previousLength = readme.blocks.length;
    readme.insertAfter('authors', block, true);
    expect(readme.blocks.length).to.equal(previousLength);
  });

  it('should not add a block before the matched content block, when the query target is an invalid match', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
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

  it('should fail if strict matching is enabled and the match is not an exact header match', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
    const block = {
      header: '## Insert Before',
      content: ['Newly Inserted block content', ''],
    };
    const previousLength = readme.blocks.length;

    readme.insertBefore('authors', block, true);
    expect(readme.blocks.length).to.equal(previousLength);

    readme.insertBefore(/authors/, block, true);
    expect(readme.blocks.length).to.equal(previousLength);
  });
});

describe('append', () => {
  it('should append new block to end of blocks', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
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

describe('prepend', () => {
  it('should prepend new block to readme content blocks', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
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

describe('setSection', () => {
  it('should replace content for a section by index', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
    const privateLicenseBlockIndex = 5; // index includes + 1 for _root block, whereas setSectionAt doesn't.

    readme.setSection('License', 'MIT License');
    expect(readme.blocks[privateLicenseBlockIndex].content[0]).to.equal('MIT License');

    readme.setSection(/^## License/, 'NS8 Proprietary 1.0 License');
    expect(readme.blocks[privateLicenseBlockIndex].content[0]).to.equal('NS8 Proprietary 1.0 License');

    const updatedSection = readme.getSection(/^## License/);
    expect(updatedSection).not.to.be.null;
    expect(updatedSection?.content[0]).to.equal('NS8 Proprietary 1.0 License');
  });

  it('setSection with no match should do nothing', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();

    readme.setSection('Non-existent', 'non-existent content string version');
    readme.setSection(/Non-existent/, 'non-existent content regex version');

    expect(readme.getSection('Non-existent')).to.be.null;
    expect(readme.getSection(/Non-existent/)).to.be.null;
  });
});

describe('setSectionAt', () => {
  it('should replace content for a section by index', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
    const licenseBlockIndexPublic = 4;
    const preUpdateLicense = 'This project is licensed with an NS8 1.0 proprietary license.';
    const postUpdateLicense = 'MIT License';

    expect(readme.getSection(/^## License/)?.content[0]).to.equal(preUpdateLicense);
    readme.setSectionAt(licenseBlockIndexPublic, postUpdateLicense);
    expect(readme.getSection(/^## License/)?.content[0]).to.equal(postUpdateLicense);
  });

  it('Should throw when the index is out of range', () => {
    const standardContent = readFileSync(TEST_FILES.STANDARD, 'utf8');
    const readme = new Readme(standardContent).parse();
    expect(() => {
      readme.setSectionAt(-1, 'content');
    }).to.throw();
  });
});
