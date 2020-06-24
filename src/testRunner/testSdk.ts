/* eslint-disable
  @typescript-eslint/ban-types,
  @typescript-eslint/explicit-module-boundary-types,
  @typescript-eslint/no-explicit-any,
  complexity,
  default-case,
  func-names,
  no-unused-expressions,
  sonarjs/cognitive-complexity,
*/

import { expect, use } from 'chai';
import 'mocha';
import chaiAsPromised from 'chai-as-promised';
import chaiAlmost from 'chai-almost';

/*
  NOTE: Mocha discourages the use of arrow functions as they change the `this` context.
  This is critically important for async methods and tests.
  See <https://mochajs.org/#arrow-functions>
  For consistency, please use `function () { return ... }` and not `() => ...`
*/

/**
 * Properties required for an SDK enum test
 * @public
 */
export interface SdkEnumTest {
  assert: any;
  input?: string | number;
}

/**
 * Properties required for an SDK model test mock
 * @public
 */
export interface SdkModelTestMock {
  assert: string;
  input: object;
}

/**
 * Properties required for an SDK string test
 * @public
 */
export interface SdkStringTest {
  assert: string;
  input?: string;
}

/**
 * Complete set of properties required for an SDK enum test suite
 * @public
 */
export interface SdkEnumTestSuite {
  conversionFunction: (data?: any) => Promise<string>;
  targetEnum: string;
  tests: SdkEnumTest[];
}

/**
 * Complete set of properties required for an SDK model test suite
 * @public
 */
export interface SdkModelTestSuite {
  conversionFunction: (data?: any) => Promise<object | Error>;
  mocks: SdkModelTestMock[];
  targetModel: string;
}

/**
 * Complete set of properties required for an SDK string test suite
 * @public
 */
export interface SdkStringTestSuite {
  conversionFunction: Assertion;
  strings: SdkStringTest[];
  targetString: string;
}

/**
 * Currently supported primitive assertions
 * @public
 */
export enum SdkTestAssertionType {
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
  IS_TRUE = 'is_true',
  IS_FALSE = 'is_false',
  TO_NOT_THROW = 'not_to_throw',
  TO_THROW = 'to_throw',
}

/**
 * Standard function signature for an assertion
 * @public
 */
export type Assertion = (data?: any) => Promise<any>;

/**
 * Defines an individual assertion
 * @public
 */
export interface SdkAssertionTest {
  assertion?: SdkTestAssertionType;
  assertionFunction: Assertion;
  input?: any;
  name: string;
  property?: string;
}

/**
 * Defines a collection of primitive tests to be executed
 * @public
 */
export interface SdkAssertionTestSuite {
  assertions: SdkAssertionTest[];
  name: string;
}

/**
 * List of assertion types that are expected to throw (or not throw)
 */
const throwables = [SdkTestAssertionType.TO_NOT_THROW, SdkTestAssertionType.TO_THROW];

/**
 * List of assertion types that expect to resolve
 */
const nonThrowables = [
  SdkTestAssertionType.IS_NOT_NULL,
  SdkTestAssertionType.IS_NULL,
  SdkTestAssertionType.IS_FALSE,
  SdkTestAssertionType.IS_TRUE,
];

/**
 *
 * @param test - a test assertion to match
 * @param collection - a collection of assertion types to validate against
 */
const matchAssertion = (test: any, collection: any): boolean => {
  return collection.find(function (t: any) {
    return t === test.assertion;
  });
};

/**
 * Executes an SDK assertion suite using the provided functions
 *
 * @param suite - The suite to be executed
 * @public
 */
export const testSdkAssertion = async function (suite: SdkAssertionTestSuite): Promise<void> {
  describe(`${suite.name} assertion suite`, async function () {
    use(chaiAsPromised);
    suite.assertions.forEach(async function (test: SdkAssertionTest): Promise<void> {
      it(test.name, async function (): Promise<void> {
        if (!test.assertion) {
          const method = async function () {
            return test.assertionFunction(test.input);
          };
          expect(method).to.not.throw();
        }
        if (matchAssertion(test, throwables)) {
          const method = async function () {
            return test.assertionFunction(test.input);
          };
          switch (test.assertion) {
            case SdkTestAssertionType.TO_NOT_THROW:
              expect(method).to.not.throw();
              break;
            case SdkTestAssertionType.TO_THROW:
              expect(method()).to.be.rejectedWith(Error);
              break;
          }
        }
        if (matchAssertion(test, nonThrowables)) {
          const result = await test.assertionFunction(test.input);
          const value = test.property ? result[test.property] : result;
          switch (test.assertion) {
            case SdkTestAssertionType.IS_NOT_NULL:
              expect(value).to.not.be.null;
              break;
            case SdkTestAssertionType.IS_NULL:
              expect(value).to.be.null;
              break;
            case SdkTestAssertionType.IS_FALSE:
              expect(value).to.be.false;
              break;
            case SdkTestAssertionType.IS_TRUE:
              expect(value).to.be.true;
              break;
          }
        }
      });
    });
  });
};

/**
 * Executes an SDK enum conversion test suite using the provided conversion
 * function and array of tests.
 *
 * @param suite - The suite to be executed
 * @public
 */
export const testSdkEnumConversion = async function (suite: SdkEnumTestSuite): Promise<void> {
  describe(`${suite.targetEnum} conversion suite`, async function (): Promise<void> {
    use(chaiAsPromised);
    suite.tests.forEach(async function (test): Promise<void> {
      it(`converts ${
        test.input
      } to ${suite.targetEnum}.${test.assert.toUpperCase()}`, async function (): Promise<void> {
        const result = await suite.conversionFunction(test.input);
        expect(result).to.equal(test.assert);
      });
    });
  });
};

/**
 * Executes an SDK model conversion test suite using the provided conversion
 * function and array of mocks.
 *
 * @param suite - The suite to be executed
 * @public
 */
export const testSdkModelConversion = async function (suite: SdkModelTestSuite): Promise<void> {
  describe(`${suite.targetModel} conversion suite`, async function (): Promise<void> {
    use(chaiAsPromised);
    suite.mocks.forEach(async function (mock): Promise<void> {
      it(`converts ${suite.targetModel}Data to ${suite.targetModel} matching ${mock.assert}`, async function (): Promise<void> {
        if (mock.assert === 'throws') {
          await expect(suite.conversionFunction()).to.be.rejectedWith(Error);
        } else {
          const result = await suite.conversionFunction(mock.input);
          const match = Object.keys(result).find((r) => r === mock.assert);
          expect(match).to.not.be.undefined;
        }
      });
    });
  });
};

/**
 * Executes an SDK string conversion test suite using the provided conversion
 * function and array of tests.
 *
 * @param suite - The suite to be executed
 * @public
 */
export const testSdkStringConversion = async function (suite: SdkStringTestSuite): Promise<void> {
  describe(`${suite.targetString} conversion suite`, async function (): Promise<void> {
    suite.strings.forEach(async function (string): Promise<void> {
      it(`converts ${string.input} to ${string.assert}`, async function (): Promise<void> {
        const result = await suite.conversionFunction(string.input);
        expect(result).to.equal(string.assert);
      });
    });
  });
};

/**
 * Executes an method and asserts the execution time is within bounds
 *
 * @param suite - The suite to be executed
 * @public
 */
export const testExecutionTime = function (name: string, method: any, time: number) {
  describe(`${name} execution time test`, function () {
    use(chaiAlmost());
    const start = new Date();
    const deviance = time + 500;

    before(function () {
      this.timeout(deviance);
      return method(time);
    });

    it(`executes ${name} in ${time} ms`, function () {
      const end = new Date();
      const runtime = end.getTime() - start.getTime();
      expect(runtime).to.be.almost(time, deviance);
    });
  });
};
