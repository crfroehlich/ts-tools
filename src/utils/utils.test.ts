import { sleep } from './utils';

import { SdkTestAssertionType, testSdkAssertion } from '../testRunner/testSdk';

/**
 * Verifies the processing of env variables
 */

testSdkAssertion({
  name: 'Test sleep function',
  assertions: [
    {
      name: 'sleeps for 10ms',
      assertionFunction: async (input: number) => {
        await sleep(input);
        return true;
      },
      input: 10,
      assertion: SdkTestAssertionType.IS_TRUE,
    },
    {
      name: 'sleeps for default ms',
      assertionFunction: async () => {
        await sleep();
        return true;
      },
      assertion: SdkTestAssertionType.IS_TRUE,
    },
  ],
});
