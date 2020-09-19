#!/usr/bin/env node
/* eslint-disable complexity */
import * as path from 'path';
import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { getCliLogger } from '../logger/logger';
import { isRunAsScript } from '../utils/utils';

/**
 * Uses \@microsoft/api-extractor to produce API documentation for this project
 * @remarks API Documentation generator
 *
 * @public
 */
export const generateApi = (configPath?: string): void => {
  const log = getCliLogger('js-tools/generate-api');

  let apiExtractorJsonPath = '';
  // Get any command line arguments that might have been passed
  const args = process.argv.slice(2);

  // If we passed in a path, use it
  const stageArg = args?.find((a) => a.startsWith('--path='));
  if (stageArg) {
    apiExtractorJsonPath = stageArg.split('=')?.[1];
  }
  if (!existsSync(apiExtractorJsonPath)) {
    apiExtractorJsonPath = configPath || '';
  }
  if (!existsSync(apiExtractorJsonPath)) {
    apiExtractorJsonPath = path.join(__dirname, '../../api-extractor.json');
  }
  if (!existsSync(apiExtractorJsonPath)) {
    throw new Error(`Could find config file: ${apiExtractorJsonPath}`);
  }
  // Load and parse the api-extractor.json file
  const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);

  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  let indexDTs = readFileSync(extractorConfig.mainEntryPointFilePath, 'utf8');
  const packageDocumentation = `// Public Domain.

  /**
   * ${packageJson.name}
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

  writeFileSync(extractorConfig.mainEntryPointFilePath, indexDTs);

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
    log.warn(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`,
    );
    process.exitCode = 1;
  }
};

if (isRunAsScript(__filename)) {
  generateApi();
}
