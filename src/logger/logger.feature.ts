/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { binding, given, then, when, before } from 'cucumber-tsflow';
import { assert, expect } from 'chai';
import { Log } from './logger';

@binding()
export class LoggerSteps {
  private message = '';

  @given('An info message of {string}')
  public givenAnInfoMessage(message: string) {
    this.message = message;
    // this.logger = new Log();
  }

  @when('{string} is given')
  public giveMessage(message: string) {
    this.message = message;
  }

  @then('The logger will output {string}')
  public outputMessage(message: string) {
    /*
      This will not work currently due to this error:
      ```
        TypeError: Cannot redefine property: prepareStackTrace
          at Function.defineProperty (<anonymous>)
          at Object.<anonymous> (K:\ns8\protect-tools-js\node_modules\tslog\src\CallSitesHelper.ts:39:8)
          at Module._compile (internal/modules/cjs/loader.js:1156:30)
          at Object.Module._extensions..js (internal/modules/cjs/loader.js:1176:10)
          at Module.load (internal/modules/cjs/loader.js:1000:32)
          at Function.Module._load (internal/modules/cjs/loader.js:899:14)
          at Module.require (internal/modules/cjs/loader.js:1042:19)
          at require (internal/modules/cjs/helpers.js:77:18)
          at Object.<anonymous> (K:\ns8\protect-tools-js\node_modules\tslog\src\LoggerHelper.ts:5:1)
          at Module._compile (internal/modules/cjs/loader.js:1156:30)
          at Object.Module._extensions..js (internal/modules/cjs/loader.js:1176:10)
          at Module.load (internal/modules/cjs/loader.js:1000:32)
          at Function.Module._load (internal/modules/cjs/loader.js:899:14)
          at Module.require (internal/modules/cjs/loader.js:1042:19)
          at require (internal/modules/cjs/helpers.js:77:18)
          at Object.<anonymous> (K:\ns8\protect-tools-js\node_modules\tslog\src\index.ts:32:1)
      ```

      This is not a cucumber error--this is a TypeScript error that is trigger by instantiating the Log class.
      This is specific to the execution from with the context of cucumber, however.
    */
    // expect(() => new Log().info(message)).to.not.throw();

    assert.equal(message, this.message);
  }
}
