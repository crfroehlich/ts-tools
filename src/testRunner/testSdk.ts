/* eslint-disable
  @typescript-eslint/ban-types,
  @typescript-eslint/no-explicit-any,
  no-unused-expressions,
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

/* eslint-enable @typescript-eslint/no-explicit-any */

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
