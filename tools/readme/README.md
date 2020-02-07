# `readme`

Programmatically manipulate sections in a readme.

## Usage

```javascript
const readme = await new Readme('./Readme.md').parse();
readme.setSection(/^ *# Table of Contents/, 'New Content');
const newReadme = readme.export();
```

## API

## Types

`BlockContent`

+ `string[]`

## Interfaces

`Block`
properties:
  + header: `string`
  + content: `BlockContent`

# The `Readme` class

## Instance Methods


### `readme.getSection(target: string | regex, strict:Boolean = false): Block`

Queries the readme for a section by a `string` comparison or `RegExp` test.

#### params 
  + target: `string | regex`
  + strict: `Boolean`

#### returns
  + an array of `Block` objects


### `readme.getSections(target: string | regex): Block[] `

Gets an array of sections matching a `string` comparison or a `RegExp` test.
#### params 
  + target: `string | regex`

#### returns
  + an array of `Block` objects

### `async parse()`
Converts a readme file into a list of content blocks in the same order found in the file. Then it indexes them by their header to support querying.

#### params
  + none

#### returns
  + the `Readme` instance created by the `Readme` constructor 

### `setSection(target: string | regex, content: string, strict=false)`
Queries the readme file for the first section matching the target `string` or `RegExp` pattern, and replaces it with the supplied content. 

#### params 
  + target: `string | regex`
  + content: `string`
  + strict: `Boolean` - in the case of a string comparison, whether to match exactly or to test whether a header includes the target string. 


### `export()`
Renders the readme, including any modifications to sections, to text.
