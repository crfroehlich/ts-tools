# Readme Tool

## Table of Contents

- [Readme Tool](#readme-tool)
  - [Purpose of the `readme` Tool](#purpose-of-the-readme-tool)
  - [Example Programmatic Usage](#example-programmatic-usage)
    - [Modifying an Existing Readme](#modifying-an-existing-readme)

## Purpose of the `readme` Tool

The `readme` package is meant to facilitate automated creation and updates for readme files. It's a useful tool to call via a `yarn` script, for example.

## Example Programmatic Usage

### Modifying an Existing Readme

```typescript
import { Readme } from './src/readme/readme';
const content = `
# Test Readme
This is a demonstration readme for the ts-tools readme tool.
## Contributing
Please submit a pull request.
`;
// read in and parse the readme into content blocks
const readme = new Readme(content);
const prLink = '';
// Add a contributing block if it doesn't exist
if (!readme.getSection(/^ *#* Contributing/)) {
  readme.setSection(
    '## Contributing',
    'Please submit a pull request <a href="https://github.com/crfroehlich/ts-tools/pulls">here</a>.',
  );
}
// Add a License block if it doesn't exist
if (!readme.getSection(/^# License/)) {
  readme.appendBlock(Readme.getLicenseBlock());
}
// Generate a Table of Contents from the existing readme and insert it the title.
if (!readme.getSection(/^ *#* Table of Contents/)) {
  readme.insertAfter(/# Test Readme/, readme.getTocBlock());
}
```
