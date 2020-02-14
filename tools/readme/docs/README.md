[readme](README.md) › [Globals](globals.md)

# readme

Programmatically manipulate and transform sections in a readme.

## Generate a table of contents

```javascript
const readme = await new Readme('./Readme.md').parse();
readme.setSection(/^# `readme`/, readme.toc());
console.log(readme.export());
```

##  Example markdown
The markdown file used in these examples is [here](example.md).

## Replace a section

`.setSection()` lets you replace the content of the first matching section.

```javascript
const readme = await new Readme('./Readme.md').parse();
const updatedDescription = 'Readme is a library for programmatically manipulating and transforming sections in a readme.'
readme.setSection(/^# readme/, updatedDescription);
await promisify(fs.writeFile('./Readme.md', 'utf8'), readme.export());
```

## Query Section(s) by string or `RegExp`

```javascript
const readme = await new Readme('./Readme.md').parse();
const toc = readme.getSection('Table of Contents');
const toc2 readme.getSection(/^ *#+ *Table of Contents/);
```

