import { BundleTarget, getWebpackConfig } from './scripts/webpack';

export default getWebpackConfig({
  bundleTarget: BundleTarget.NODE,
  distDirectory: '../dist',
  sourceDirectory: './src/index.ts',
  libraryName: 'Protect-JS-Tools',
});
