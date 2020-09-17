module.exports = {
  extension: ['ts'],
  require: ['ts-node/register'],
  slow: 50,
  spec: 'src/**/*.test.ts',
  ignore: 'src/**/*.readme.*',
  exclude: 'src/**/*.readme.ts,src/**/*.readme.test.ts',
};
