# Example markdown

# aws credentials library

This is a library to securely store your aws credentials.

## command line interface

npm install -g awscreds


## programmatic use

```javascript
const awscreds = require('awscreds');
awscreds.load(process.stdin);
awscreds.store();
```

const awsCreds = require('awscreds');


## contributing

To contribute, see the issues page and follow the template.

## license

MIT LICENSE
