module.exports = function (config) {
  config.set({
    coverageAnalysis: 'off',
    files: ['src/**/*.ts', 'src/**/*.md'],
    maxConcurrentTestRunners: 0,
    mochaOptions: {
      config: '.mocharc.stryker.js',
    },
    mutate: ['src/**/*.ts'],
    mutator: 'typescript', // Specify that you want to mutate typescript code
    // transpilers: [
    //   'typescript', // Specify that your typescript code needs to be transpiled before tests can be run. Not needed if you're using ts-node Just-in-time compilation.
    // ],
    packageManager: 'yarn',
    reporters: ['clear-text', 'progress', 'dots', 'dashboard', 'html'],
    testFramework: 'mocha',
    testRunner: 'mocha',
    tsconfigFile: 'tsconfig.stryker.json',
  });
};
