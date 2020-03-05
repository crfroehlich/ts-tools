/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { join } from 'path';
import { readFileSync } from 'fs';
import 'mocha';
import { Readme, ReadmeBlock } from './readme';
import { Block } from './types';

const TEST_FILES = {
  EMPTY: readFileSync(join(__dirname, 'test-data/empty.md'), 'utf8'),
  DUPLICATE_HEADERS: readFileSync(join(__dirname, 'test-data/duplicateHeaders.md'), 'utf8'),
  HEADERS_ONLY: readFileSync(join(__dirname, 'test-data/headersOnly.md'), 'utf8'),
  CODE_BLOCKS_CONTAINING_HEADERS: readFileSync(join(__dirname, 'test-data/codeBlocksWithHeaders.md'), 'utf8'),
  STANDARD: readFileSync(join(__dirname, 'test-data/standard.md'), 'utf8'),
  MISSING_TOC: readFileSync(join(__dirname, 'test-data/missingToc.md'), 'utf8'),
};

describe('readme.parse()', () => {
  it('parses a block correctly', () => {
    const parseResult = Readme.parse('# Header\nContent\n\n');
    expect(
      parseResult.find(block => block.header === '# Header' && block.content === 'Content\n')
    ).not.to.be.undefined;
  });
  it('parses a block correctly', () => {
    const parseResult = Readme.parse();
    expect(
      parseResult.length
    ).to.equal(1);
  });
})

describe('readme constructor', () => {

  it('empty readme content should only result in a _root block and a _root indexedBlock.', () => {
    const readme = new Readme();
    expect(readme.blocks.length === 1);
    expect(readme.indexedBlocks.size === 1);
  });

  it('Standard readme: 5 unique headers should result in 6 blocks (+1 for internal root block).', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    expect(readme.blocks.length).to.equal(6);
  });

  it('Duplicate headers: 6 unique headers and 1 dupe should result in 7 blocks (+1 for internal root block).', () => {
    const readme = new Readme(TEST_FILES.DUPLICATE_HEADERS);
    expect(readme.blocks.length).to.equal(7);
  });

  it('Triplicate headers: should result in 4 blocks (+1 for root).', () => {
    const readme = new Readme(TEST_FILES.HEADERS_ONLY);
    expect(readme.blocks.length).to.equal(4);
  });

  it('headers inside of code blocks are not parsed', () => {
    const readme = new Readme(TEST_FILES.CODE_BLOCKS_CONTAINING_HEADERS);
    expect(readme.blocks.length).to.equal(4 + 1); // 1 for internal _root block
    expect(
      readme.blocks.some(block => block.header.includes('This is a code comment, not a markdown header'))
    ).to.equal(false);
  });


});

describe('readme.getSection()', () => {

  it('should return null for any getSection call with an emtpy file', () => {
    const readme = new Readme(TEST_FILES.EMPTY);
    const nonExistentSection = readme.getSection('Table of Contents');
    expect(nonExistentSection).to.equal(null);
  });

  it('should return null when a query doesnt match any heading', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    expect(readme.getSection('Non-existent Heading')).to.be.null;
  });

  it('should return a readme block for an existing section using a string match', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const section = readme.getSection('Table of Contents');
    expect(section).not.to.be.null;
    expect(section).to.have.property('content');
    expect(section).to.have.property('header');
  });

  it('should return value for an existing section using a RegExp', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const section = readme.getSection(/^ *#+ *Table of Contents/);
    expect(section).not.to.be.null;
    expect(section).to.have.property('content');
    expect(section).to.have.property('header');
  });

});

describe('readme.getSectionAt()', () => {
  it('should throw if the index is out of range', () => {

    expect(() => {
      const readme = new Readme(TEST_FILES.STANDARD);
      readme.getSectionAt(-1);
    }).to.throw();

    expect(() => {
      const readme = new Readme(TEST_FILES.STANDARD);
      readme.getSectionAt(readme.blocks.length + 1);
    }).to.throw();

  });

  it('Should return the expected content block, given the appropriate block index.', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const newBlockRef = {
      header: '## Insert Before Test',
      content: 'Newly-inserted block content',
    };
    readme.appendBlock(newBlockRef);
    const blockCount = readme.blocks.length;
    const fetchedBlock = readme.getSectionAt(blockCount - 1);
    expect(fetchedBlock).to.equal(newBlockRef);
  });

});

describe('readme.getSections()', () => {

  it('Should return any emtpy array for any getSections call where there are no matches.', () => {
    const readme = new Readme(TEST_FILES.EMPTY);
    const sections = readme.getSections('Table of Contents');
    expect(sections.length).to.equal(0);
  });

  it('Should return two entries for a duplicate header.', () => {
    const readme = new Readme(TEST_FILES.DUPLICATE_HEADERS);
    const sections = readme.getSections('Purpose');
    expect(sections.length).to.equal(2);
  });

  it('Should return both sections for duplicate match with Regex query.', () => {
    const readme = new Readme(TEST_FILES.DUPLICATE_HEADERS);
    const sections = readme.getSections(/## Purpose/);
    expect(sections.length).to.equal(2);
  });

  it('Should return no sections for non-matching Regex query.', () => {
    const readme = new Readme(TEST_FILES.DUPLICATE_HEADERS);
    const sections = readme.getSections(/Porpose/);
    expect(sections.length).to.equal(0);
  });

  it('Should return two entries for a duplicate header with a string query where strict string matching is true.', () => {

    const readme = new Readme(TEST_FILES.DUPLICATE_HEADERS);
    const sectionsStrictNoMatch = readme.getSections('Purpose', true);
    expect(sectionsStrictNoMatch.length).to.equal(2);

    const sectionsStrictMatchRegExp = readme.getSections('Porpose', true);
    expect(sectionsStrictMatchRegExp.length).to.equal(0);

  })
  it('Should return two entries for a duplicate header with a string query where strict string matching is false .', () => {
    const readme = new Readme(TEST_FILES.DUPLICATE_HEADERS);
    const sectionsStrictNoMatch = readme.getSections('Purpose');
    expect(sectionsStrictNoMatch.length).to.equal(2);

    const sectionsStrictMatchRegExp = readme.getSections('Porpose');
    expect(sectionsStrictMatchRegExp.length).to.equal(0);
  });

  it('should ignore content inside of code blocks', () => {
    const readme = new Readme(TEST_FILES.CODE_BLOCKS_CONTAINING_HEADERS);
    const section = readme.getSection('Code Header');
    expect(section).to.be.null;
  });

  it('should return value for an existing section using a RegExp', () => {
    const readme = new Readme(TEST_FILES.HEADERS_ONLY);
    const sections = readme.getSections('Table of Contents');
    expect(sections.length).to.equal(3);
    expect(sections.every(({ header }) => header.includes('Table of Contents')));
    expect(sections.every(({ content }) => content.trim().length === 0));
  });
});

describe('readme.toString()', () => {
  const readme = new Readme(TEST_FILES.STANDARD);
  expect(readme.toString()).to.be.a('string');
  expect(readme.toString()).to.equal(`${readme}`);
})

describe('readme.export()', () => {

  it('Export should be the same as the file content if it is not transformed.', () => {
    expect((new Readme(TEST_FILES.STANDARD).export())).to.equal(TEST_FILES.STANDARD);
    expect((new Readme(TEST_FILES.EMPTY).export()).length).to.equal(TEST_FILES.EMPTY.length);
  });

});

describe('readme.getTocBlock()', () => {
  it('Generates a correct toc using a default target startAt index of 1.', () => {
    const readme = new Readme(TEST_FILES.MISSING_TOC);
    const toc = readme.getTocBlock();
    expect(toc.header).to.equal('## Table of Contents');
    expect(toc.content).to.equal(
      '  + [Header with a `tag in it`](#header-with-a-tag-in-it)\n' +
        '  + [Sub-purpose section](#sub-purpose-section)\n' +
        '    + [Sub-sub purpose section](#sub-sub-purpose-section)\n' +
        '      + [`yarn` scripts](#yarn-scripts)\n' +
        '  + [Authors](#authors)\n' +
        '  + [Contributing](#contributing)\n' +
        '  + [License](#license)' + 
        '\n\n',
    );
  });

  it('Generates a correct toc using a startAt index of 0.', () => {
    const readme = new Readme(TEST_FILES.MISSING_TOC);
    const toc = readme.getTocBlock(0);
    expect(toc.header).to.equal('## Table of Contents');
    expect(toc.content).to.equal(
      '+ [Demo Repo](#demo-repo)\n' +
        '  + [Header with a `tag in it`](#header-with-a-tag-in-it)\n' +
        '  + [Sub-purpose section](#sub-purpose-section)\n' +
        '    + [Sub-sub purpose section](#sub-sub-purpose-section)\n' +
        '      + [`yarn` scripts](#yarn-scripts)\n' +
        '  + [Authors](#authors)\n' +
        '  + [Contributing](#contributing)\n' +
        '  + [License](#license)' +
        '\n\n'
    );
  });

  it('throws if an invalid index is passed', () => {
    expect(() => {
      const readme = new Readme(TEST_FILES.MISSING_TOC);
      readme.getTocBlock(-1);
    }).to.throw();
  });
});

describe('readme.insertBefore()', () => {
  it('should add a block before the matched content block, when the query target is a valid match', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const previousLength = readme.blocks.length;
    const newBlock = {
      header: '## Insert Before',
      content: 'Newly Inserted block content',
    };
    readme.insertBefore('# Purpose', newBlock);
    expect(readme.blocks.length).to.equal(previousLength + 1);

    const foundIndex = readme.blocks.findIndex((block: Block) => {
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
      .to.deep.equal('Newly Inserted block content');
  });

  it('should not add a block before the matched content block, when the query target is an invalid match', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const block = {
      header: '## Insert Before',
      content: 'Newly Inserted block content',
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

describe('readme.insertAfter()', () => {
  it('should add a block before the matched content block, when the query target is a valid match', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const previousLength = readme.blocks.length;
    const newBlock = {
      header: '## Insert After',
      content: 'Newly Inserted block content',
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
      .to.deep.equal('Newly Inserted block content');
  });

  it('should fail if strict matching is enabled and the match is not an exact header match', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const block = {
      header: '## Insert Before',
      content: 'Newly Inserted block content',
    };
    const previousLength = readme.blocks.length;
    readme.insertAfter('authors', block, true);
    expect(readme.blocks.length).to.equal(previousLength);
  });

  it('should not add a block before the matched content block, when the query target is an invalid match', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const block = {
      header: '## Insert Before',
      content: 'Newly Inserted block content',
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
    const readme = new Readme(TEST_FILES.STANDARD);
    const block = {
      header: '## Insert Before',
      content: 'Newly Inserted block content',
    };
    const previousLength = readme.blocks.length;

    readme.insertBefore('authors', block, true);
    expect(readme.blocks.length).to.equal(previousLength);

    readme.insertBefore(/authors/, block, true);
    expect(readme.blocks.length).to.equal(previousLength);
  });
});

describe('readme.appendBlock()', () => {
  it('should append new block to end of blocks', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const initialBlockCount = readme.blocks.length;
    const block = {
      header: '## Append',
      content: 'Appended Content',
    };
    readme.appendBlock(block);
    const finalBlock = readme.blocks[readme.blocks.length - 1];

    expect(readme.blocks.length).to.equal(initialBlockCount + 1);
    expect(finalBlock.header).to.deep.equal('## Append');
    expect(finalBlock.content).to.deep.equal('Appended Content');
  });
  // TODO: test indexing by searching via Query
});

describe('readme.prependBlock', () => {
  it('should prepend new block to readme content blocks', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const initialBlockCount = readme.blocks.length;
    const block = {
      header: '## Prepend',
      content: 'Prepended Content',
    };
    readme.prependBlock(block);
    const firstBlock = readme.blocks[1];

    expect(readme.blocks.length).to.equal(initialBlockCount + 1);
    expect(firstBlock.header).to.deep.equal('## Prepend');
    expect(firstBlock.content).to.deep.equal('Prepended Content');

    // TODO: test indexing by searching via Query
  });
});

describe('readme.setSection', () => {
  it('should replace content for a section by index', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const privateLicenseBlockIndex = 5; // index includes + 1 for _root block, whereas setSectionAt doesn't.

    readme.setSection('License', 'MIT License');
    expect(readme.blocks[privateLicenseBlockIndex].content).to.equal('MIT License');

    readme.setSection(/^## License/, 'NS8 Proprietary 1.0 License');
    expect(readme.blocks[privateLicenseBlockIndex].content).to.equal('NS8 Proprietary 1.0 License');

    const updatedSection = readme.getSection(/^## License/);
    expect(updatedSection).not.to.be.null;
    expect(updatedSection?.content).to.equal('NS8 Proprietary 1.0 License');
  });


  it('Should successfully return an updated section.', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const noModificationExport = readme.export();
    readme.setSection('Table of Contents', 'REPLACED CONTENT');
    expect(readme.getSection('Table of Contents')?.content).to.equal('REPLACED CONTENT');
    expect(readme.getSectionAt(1)?.content).to.equal('REPLACED CONTENT');

    const modificationExport = readme.export();
    expect(noModificationExport).not.to.equal(modificationExport);
  });

  it('setSection with no match should do nothing', () => {
    const readme = new Readme(TEST_FILES.STANDARD);

    readme.setSection('Non-existent', 'non-existent content string version');
    readme.setSection(/Non-existent/, 'non-existent content regex version');

    expect(readme.getSection('Non-existent')).to.be.null;
    expect(readme.getSection(/Non-existent/)).to.be.null;
  });
});

describe('readme.toString method', () => {
  it('converts the readme instance into an exported readme string', () => {
    const readme = new Readme('# Demo Readme\n## Contributing\nYou can contribute by submitting a PR.');
    expect(`${readme}`).to.be.a('string');
  });
});

describe('readme.getLicenseBlock', () => {
  it('has a method that generates an NS8 license block', () => {
    const licenseBlock = Readme.getLicenseBlock();
    expect(licenseBlock.header).to.equal('## License');
    expect(licenseBlock.content).to.deep.equal('NS8 PROPRIETARY 1.0');
  });

  it('has a method that generates an NS8 license block', () => {
    const licenseBlock = Readme.getLicenseBlock('###');
    expect(licenseBlock.header).to.equal('### License');
    expect(licenseBlock.content).to.deep.equal('NS8 PROPRIETARY 1.0');
  });
});

describe('readme.setSectionAt', () => {
  it('should replace content for a section by index', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const licenseBlockIndexPublic = 4;
    const preUpdateLicense = 'This project is licensed with an NS8 1.0 proprietary license.\n';
    const postUpdateLicense = 'MIT License\n';

    expect(readme.getSection(/^## License/)?.content).to.equal(preUpdateLicense);
    readme.setSectionAt(licenseBlockIndexPublic, postUpdateLicense);
    expect(readme.getSection(/^## License/)?.content).to.equal(postUpdateLicense);
  });

  it('Should throw when the index is out of range', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    expect(() => {
      readme.setSectionAt(-1, 'content');
    }).to.throw();
  });
});

describe('readme.appendContent()', () => {
  it('should append content and reflect a block count of 1 more than before append.', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    readme.appendContent(TEST_FILES.STANDARD);
    expect(readme.export().length).to.be.greaterThan(TEST_FILES.STANDARD.length);
  });
});

describe('readme.prependContent()', () => {
  it('should prepend content and reflect a block count of 1 more than before prepend.', () => {
    const readme = new Readme(TEST_FILES.STANDARD);
    const initialBlockCount = readme.blocks.length;
    readme.prependContent(`# New Section\nNew Section Content\n\n`);
    expect(readme.blocks.length).to.equal(initialBlockCount + 1);
    expect(readme.blocks[1].header).to.equal('# New Section');
    expect(readme.blocks[1].content).to.equal('New Section Content\n');
  });
});

describe('Readme.parseBlockFromContent()', () => {
  const parsedContentBlock = Readme.parseBlockFromContent('# Header\nContent\n');


  it ('Should return a parsed block', () => {
    expect(parsedContentBlock).to.have.property('header');
    expect(parsedContentBlock).to.have.property('content');

    expect(parsedContentBlock.header).to.equal('# Header');
    expect(parsedContentBlock.content).to.equal('Content\n');
  });

});

describe('ReadmeBlock.toString()', () => {
  it ('should', () => {
    const readmeBlock = new ReadmeBlock({
      header: '## test header',
      content: 'test content'
    });
    expect(readmeBlock.toString()).to.equal('## test header\ntest content\n');
  });
})
