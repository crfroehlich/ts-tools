const common = [
  '--require-module ts-node/register',
  '--require src/**/*.feature.ts',
  '--format message',
  '--format summary',
  '--format html',
  '--format pretty',
  '--format progress-bar',
  '--format rerun:@rerun.txt',
  '--format usage:reports/cucumber.txt',
].join(' ');

module.exports = {
  default: common,
};
