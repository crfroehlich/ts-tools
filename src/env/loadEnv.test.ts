/* eslint-disable no-unused-expressions */
import { loadEnv } from './loadEnv';
import { SdkTestAssertionType, testSdkAssertion } from '../testRunner/testSdk';

/**
 * Verifies the processing of env variables
 */

testSdkAssertion({
  name: 'Process Environment Variables',
  assertions: [
    {
      name: 'loads the .env with defaults',
      conversionFunction: loadEnv,
      input: undefined,
      assertion: SdkTestAssertionType.IS_NOT_NULL,
      property: 'NODE_ENV',
    },
    {
      name: 'loads the .env with custom config',
      conversionFunction: loadEnv,
      input: { overrideProcessEnv: true },
      assertion: SdkTestAssertionType.IS_NOT_NULL,
      property: 'NODE_ENV',
    },
  ],
});
