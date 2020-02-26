import { expect } from 'chai';
import 'mocha';
import { Log } from './logger';

describe('Logging', () => {
  it('logs', () => {
    const log = new Log('unit-test');
    log.info('This is a message', { foo: 'bar', bar: 'foo' });
    // eslint-disable-next-line no-unused-expressions
    expect(true).to.be.true;
  });
});
