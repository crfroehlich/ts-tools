/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable
    no-labels,
    no-restricted-syntax,
    no-unused-expressions,
    no-unused-labels,
*/
import {
  SdkTestAssertionType,
  testSdkAssertion,
  testSdkEnumConversion,
  testSdkModelConversion,
  testSdkStringConversion,
  testExecutionTime,
} from './testSdk';
import { sleep } from '../utils';

/**
 * Generalized assertion tests
 */

testSdkAssertion({
  name: 'Tests the Test Suite',
  assertions: [
    {
      assertion: SdkTestAssertionType.IS_NOT_NULL,
      assertionFunction: async () => 1,
      name: 'Assert is not null',
    },
    {
      assertion: SdkTestAssertionType.IS_NULL,
      assertionFunction: async () => null,
      name: 'Assert is null',
    },
    {
      assertion: SdkTestAssertionType.IS_TRUE,
      assertionFunction: async () => true,
      name: 'Assert is true',
    },
    {
      assertion: SdkTestAssertionType.IS_TRUE,
      assertionFunction: async () => {
        return { prop: true };
      },
      name: 'Assert is true',
      property: 'prop',
    },
    {
      assertion: SdkTestAssertionType.IS_TRUE,
      assertionFunction: async () => {
        await sleep(1000);
        return { prop: true };
      },
      name: 'Real async assert is true',
      property: 'prop',
    },
    {
      assertion: SdkTestAssertionType.IS_FALSE,
      assertionFunction: async () => false,
      name: 'Assert is false',
    },
    {
      assertionFunction: async () => true,
      name: 'Assert does not throw',
    },
    {
      assertionFunction: async () => {
        return { prop: true };
      },
      name: 'Assert does not throw with value',
      property: 'prop',
    },
    {
      name: 'Assert does throw',
      assertionFunction: async () => {
        return Promise.reject(new Error('Test error'));
      },
      assertion: SdkTestAssertionType.TO_THROW,
    },
  ],
});

/**
 * Enum conversion tests
 */

enum TestEnum {
  TEST_1 = 'test_1',
}

interface TestAssertion {
  input?: string;
  assert: TestEnum | string;
}

const tests: TestAssertion[] = [
  {
    input: 'test_1',
    assert: TestEnum.TEST_1,
  },
];

testSdkEnumConversion({
  conversionFunction: async () => TestEnum.TEST_1,
  targetEnum: TestEnum.TEST_1,
  tests,
});

/**
 * Test Mock suite
 */

interface TestMock {
  name: string;
}

interface TestMockAssertion {
  input: TestMock;
  assert: string;
}

const TestMockAssertions: TestMockAssertion[] = [
  {
    input: {
      name: 'foo',
    },
    assert: 'name',
  },
  {
    input: {
      name: 'bar',
    },
    assert: 'throws',
  },
];

testSdkModelConversion({
  conversionFunction: async (data: TestMock): Promise<object> => {
    if (data?.name === 'foo') {
      return { name: 'foo' };
    }
    return Promise.reject(new Error('Asserting errors'));
  },
  mocks: TestMockAssertions,
  targetModel: 'TestMock',
});

/**
 * String conversion test suite
 */

const testStrings: TestAssertion[] = [
  {
    input: 'United States of America',
    assert: 'US',
  },
];

testSdkStringConversion({
  conversionFunction: async () => 'US',
  strings: testStrings,
  targetString: 'test strings',
});

testExecutionTime('sleeps for 1 second', sleep, 1000);
testExecutionTime('sleeps for 5 seconds', sleep, 5000);
