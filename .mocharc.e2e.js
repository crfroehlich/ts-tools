module.exports = {
  bail: false,
  exit: true,
  extension: ['ts'],
  require: ['ts-node/register'],
  slow: 5000,
  spec: 'test/**/*Test.ts',
  timeout: 10000,
};
