import * as path from 'path';
import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor';
import { readFileSync, writeFileSync } from 'fs';
import { getLogger } from '../logger/logger';

const log = getLogger();

const apiExtractorJsonPath: string = path.join(__dirname, './api-extractor.json');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
let indexDTs = readFileSync('dist/index.d.ts', 'utf8');
const packageDocumentation = `// Copyright (c) NS8, Inc. All rights reserved. UNLICENSED. Proprietary.

/**
 * NS8 ${packageJson.name.replace('@ns8/', '')}
 *
 * @remarks
 * ${packageJson.description}
 *
 * @packageDocumentation
 */`;

indexDTs = `
${packageDocumentation}

${indexDTs}
`;

writeFileSync('dist/index.d.ts', indexDTs);

// Load and parse the api-extractor.json file
const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);

/**
 * Uses \@microsoft/api-extractor to produce API documentation for this project
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
    log.info('API Extractor completed successfully');
    process.exitCode = 0;
  } else {
    log.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`,
    );
    process.exitCode = 1;
  }
};

if (__filename === process?.mainModule?.filename) {
  generateApi();
}
