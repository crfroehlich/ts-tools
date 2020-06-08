/* eslint-disable
  @typescript-eslint/ban-types,
  @typescript-eslint/no-explicit-any,
  complexity,
  default-case,
  no-unused-expressions,
  sonarjs/cognitive-complexity,
*/

import { expect, use } from 'chai';
import 'mocha';
import chaiAsPromised from 'chai-as-promised';

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
  input: any;
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
  conversionFunction: Function;
  targetEnum: string;
  tests: SdkEnumTest[];
}

/**
 * Complete set of properties required for an SDK model test suite
 * @public
 */
export interface SdkModelTestSuite {
  conversionFunction: Function;
  mocks: SdkModelTestMock[];
  targetModel: string;
}

/**
 * Complete set of properties required for an SDK string test suite
 * @public
 */
export interface SdkStringTestSuite {
  conversionFunction: Function;
  strings: SdkStringTest[];
  targetString: string;
}

export enum SdkTestAssertionType {
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
  IS_TRUE = 'is_true',
  IS_FALSE = 'is_false',
  TO_NOT_THROW = 'not_to_throw',
  TO_THROW = 'to_throw',
}

export interface SdkAssertionTest {
  assertion?: SdkTestAssertionType;
  conversionFunction: Function;
  input?: any;
  name: string;
  property?: string;
}

export interface SdkAssertionTestSuite {
  assertions: SdkAssertionTest[];
  name: string;
}

/**
 * Executes an SDK enum conversion test suite using the provided conversion
 * function and array of tests.
 *
 * @param suite - The suite to be executed
 * @public
 */
export const testSdkAssertion = (suite: SdkAssertionTestSuite): void => {
  describe(`${suite.name} assertion suite`, () => {
    use(chaiAsPromised);
    suite.assertions.forEach((test) => {
      it(test.name, () => {
        const throwables = [SdkTestAssertionType.TO_NOT_THROW, SdkTestAssertionType.TO_THROW];
        const nonThrowables = [
          SdkTestAssertionType.IS_NOT_NULL,
          SdkTestAssertionType.IS_NULL,
          SdkTestAssertionType.IS_FALSE,
          SdkTestAssertionType.IS_TRUE,
        ];
        if (!test.assertion) {
          const result = test.conversionFunction(test.input);
          const value = test.property ? result[test.property] : result;
          expect(value).to.not.throw;
        }
        if (throwables.find((t) => t === test.assertion)) {
          const method = () => test.conversionFunction(test.input);
          switch (test.assertion) {
            case SdkTestAssertionType.TO_NOT_THROW:
              expect(method).to.not.throw();
              break;
            case SdkTestAssertionType.TO_THROW:
              expect(method).to.throw();
              break;
          }
        }
        if (nonThrowables.find((t) => t === test.assertion)) {
          const result = test.conversionFunction(test.input);
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
export const testSdkEnumConversion = (suite: SdkEnumTestSuite): void => {
  describe(`${suite.targetEnum} conversion suite`, () => {
    use(chaiAsPromised);
    suite.tests.forEach((test) => {
      it(`converts ${test.input} to ${suite.targetEnum}.${test.assert.toUpperCase()}`, () => {
        const result = suite.conversionFunction(test.input);
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
export const testSdkModelConversion = (suite: SdkModelTestSuite): void => {
  describe(`${suite.targetModel} conversion suite`, () => {
    use(chaiAsPromised);
    suite.mocks.forEach((mock) => {
      it(`converts ${suite.targetModel}Data to ${suite.targetModel} matching ${mock.assert}`, () => {
        if (mock.assert === 'throws') {
          expect(() => suite.conversionFunction(mock.input)).to.throw();
        } else {
          const result = suite.conversionFunction(mock.input);
          expect(result[mock.assert]).to.not.be.undefined;
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
export const testSdkStringConversion = (suite: SdkStringTestSuite): void => {
  describe(`${suite.targetString} conversion suite`, () => {
    suite.strings.forEach((string) => {
      it(`converts ${string.input} to ${string.assert}`, () => {
        const result = suite.conversionFunction(string.input);
        expect(result).to.equal(string.assert);
      });
    });
  });
};
