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
} from './testSdk';

/**
 * Generalized assertion tests
 */

testSdkAssertion({
  name: 'Tests the Test Suite',
  assertions: [
    {
      assertion: SdkTestAssertionType.IS_NOT_NULL,
      conversionFunction: () => 1,
      name: 'Assert is not null',
    },
    {
      assertion: SdkTestAssertionType.IS_NULL,
      conversionFunction: () => null,
      name: 'Assert is null',
    },
    {
      assertion: SdkTestAssertionType.IS_TRUE,
      conversionFunction: () => true,
      name: 'Assert is true',
    },
    {
      assertion: SdkTestAssertionType.IS_TRUE,
      conversionFunction: () => {
        return { prop: true };
      },
      name: 'Assert is true',
      property: 'prop',
    },
    {
      assertion: SdkTestAssertionType.IS_FALSE,
      conversionFunction: () => false,
      name: 'Assert is false',
    },
    {
      conversionFunction: () => true,
      name: 'Assert does not throw',
    },
    {
      conversionFunction: () => {
        return { prop: true };
      },
      name: 'Assert does not throw with value',
      property: 'prop',
    },
    {
      name: 'Assert does throw',
      conversionFunction: () => {
        throw new Error('Test error');
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
  conversionFunction: () => TestEnum.TEST_1,
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
  conversionFunction: (data: TestMock) => {
    if (data?.name === 'foo') {
      return { name: 'foo' };
    }
    throw new Error('Asserting errors');
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
  conversionFunction: () => 'US',
  strings: testStrings,
  targetString: 'test strings',
});
