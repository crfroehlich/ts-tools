# Readme Tool

## Purpose of the `readme` Tool 

The `readme` package is meant to facilitate automated creation and updates for readme files.  It's a useful tool to call via a `yarn` script, for example.

## Example Programmatic Usage

### Modifying an Existing Readme

```javascript

import { Readme } from './src/readme/readme';

const content = `
# Test Readme

This is a demonstration readme for the ns8/protect-js-tools readme tool.

## Contributing

Please submit a pull request.
`;

// read in and parse the readme into content blocks
const readme = new Readme(content).parse();

// build a list of documentation links to documentation in the ns8 standard docs location 
const docsBlock = readme.buildDocumentationLinksBlock({ 
  header: '## Getting Started',
  introduction: 'The following links are a great place to start.', 
  repoRoot: process.cwd(),
});

// if there are docs in that directory, this will be a block, otherwise null
if (docsBlock) {
  readme.appendBlock(docsBlock);
};

// Add a contributing block if it doesn't exist
if (!readme.getSection(/^# Contributing/)) {
  readme.setSection(
    '## Contributing',
   'Please submit a pull request <a href="https://github.com/ns8inc/protect-tools-js/pulls">here</a>.'
  );
}

// Add a license block at the end
if (!readme.getSection(/^# License/)) {
  readme.appendBlock(Readme.getLicenseBlock());
}

// Generate a Table of Contents from the existing readme and insert it the title.
readme.insertAfter(/# Test Readme/, readme.tocBlock());
```

## Example `yarn` script

```json
"scripts": {
  "build" : "example here"
}
```
