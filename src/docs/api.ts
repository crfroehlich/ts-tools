import * as path from 'path';
import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor';

const apiExtractorJsonPath: string = path.join(__dirname, './api-extractor.json');

// Load and parse the api-extractor.json file
const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);

/**
 * Uses @microsoft/api-extractor to produce API documentation for this project
 * @remarks API Documentation generator
 * 
 * @public
 */
export const generateApi = (): void => {
  // Invoke API Extractor
  const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    // showDiagnostics: true,
    showVerboseMessages: true,
  });

  if (extractorResult.succeeded) {
    console.error('API Extractor completed successfully');
    process.exitCode = 0;
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`,
    );
    process.exitCode = 1;
  }
};

if (__filename === process?.mainModule?.filename) {
  generateApi();
}
