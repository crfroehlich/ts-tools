[readme](README.md) › [Globals](globals.md)

# readme

Programmatically manipulate and transform sections in a readme.

## Usage

### Generate a table of contents

```javascript
const readme = await new Readme('./Readme.md').parse();
readme.setSection(/^# `readme`/, readme.toc());
await promisify(fs.writeFile('./Readme.md', 'utf8'), readme.export());
```

### Replace a section

```javascript
const readme = await new Readme('./Readme.md').parse();
const updatedDescription = 'Readme is a library for programmatically manipulating and transforming sections in a readme.'
readme.setSection(/^# readme/, updatedDescription);
await promisify(fs.writeFile('./Readme.md', 'utf8'), readme.export());
```
