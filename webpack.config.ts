import { BundleTarget, getWebpackConfig } from '@ns8/protect-tools-bundle';

export default getWebpackConfig({
  bundleTarget: BundleTarget.NODE,
  distDirectory: './dist',
  sourceDirectory: './src/index.ts',
  libraryName: 'protect-tools-js',
});
