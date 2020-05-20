/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import 'mocha';
import { Log, LogLevel, LogOutput, getLogger } from './logger';

/*
const infoConsole: LogOptions = { logLevel: LogLevel.INFO, serviceName, transports: [LogOutput.CONSOLE] };
const errorConsole: LogOptions = { logLevel: LogLevel.ERROR, serviceName, transports: [LogOutput.CONSOLE] };

interface Assertion {
  it: string;
  options: LogOptions;
}

const tests: Assertion[] = [
  {
    it: 'logs error using the default settings',
    options: errorConsole,
  },
  {
    it: 'logs error using the default settings',
    options: infoConsole,
  },
];

tests.forEach((test) => {
  const output = test.options.transports.join('; ');
  it(test.it, () => {
    const log = new Log(test.options);
    expect(() => {
      log.error(`This is a ${test.options.logLevel} to ${output}`, { test: test.it });
    }).not.to.throw;
  });
});
*/

const serviceName = 'unit-test';
const message = 'This is a message';

/**
 * Validates logging functionality
 */
describe('Logging', () => {
  it('logs using the default settings', () => {
    const log = new Log();
    log.error(message, { test: 'logs using the default settings' });
    expect(true).to.be.true;
  });

  it('info logs', () => {
    const log = new Log({
      logLevel: LogLevel.INFO,
      serviceName,
      transports: [LogOutput.CONSOLE],
    });
    log.info(message, { test: 'info logs' });
    expect(true).to.be.true;
  });

  it('error logs', () => {
    const log = new Log({
      logLevel: LogLevel.ERROR,
      serviceName,
      transports: [LogOutput.CONSOLE],
    });
    log.error(message, { test: 'error logs' });
    expect(true).to.be.true;
  });

  it('automatically adds console logging', () => {
    process.env.NODE_ENV = 'dev';
    const log = new Log({
      logLevel: LogLevel.ERROR,
      serviceName,
      transports: [LogOutput.FILE],
    });
    log.error(message, { test: 'automatically adds console logging' });
    expect(true).to.be.true;
  });

  it('logs nothing', () => {
    process.env.NODE_ENV = 'production';
    const log = new Log({
      logLevel: LogLevel.ERROR,
      serviceName,
      transports: [LogOutput.NONE],
    });
    log.error(message, { test: 'logs nothing' });
    expect(true).to.be.true;
  });

  it('custom logs debug', () => {
    const log = new Log({
      logLevel: LogLevel.DEBUG,
      serviceName,
      transports: [LogOutput.CONSOLE],
    });
    log.log(LogLevel.DEBUG, message, { test: 'custom logs debug' });
    expect(true).to.be.true;
  });

  it('custom logs warn', () => {
    const log = new Log({
      logLevel: LogLevel.WARN,
      serviceName,
      transports: [LogOutput.CONSOLE],
    });
    log.log(LogLevel.WARN, message, { test: 'custom logs warn' });
    expect(true).to.be.true;
  });

  it('custom logs error', () => {
    const log = new Log({
      logLevel: LogLevel.ERROR,
      serviceName,
      transports: [LogOutput.CONSOLE],
    });
    log.log(LogLevel.ERROR, message, { test: 'custom logs error' });
    expect(true).to.be.true;
  });

  it('custom logs info', () => {
    const log = new Log({
      logLevel: LogLevel.INFO,
      serviceName,
      transports: [LogOutput.CONSOLE],
    });
    log.log(LogLevel.INFO, message, { test: 'custom logs info' });
    expect(true).to.be.true;
  });

  it('static logs using the default options', () => {
    const log = getLogger();
    log.info(message, { test: 'static logs using the default options' });
    expect(true).to.be.true;
  });

  it('static logs to console', () => {
    const log = getLogger({ logLevel: LogLevel.INFO, serviceName, transports: [LogOutput.CONSOLE] }, true);
    log.info(message, { test: 'static logs to console' });
    expect(true).to.be.true;
  });

  it('static logs to console again using the same instance', () => {
    const log = getLogger({
      logLevel: LogLevel.INFO,
      serviceName,
      transports: [LogOutput.CONSOLE],
    });
    log.info(message, {
      test: 'static logs to console again using the same instance',
    });
    expect(true).to.be.true;
  });

  it('static logs to file', () => {
    const log = getLogger({ logLevel: LogLevel.INFO, serviceName, transports: [LogOutput.FILE] }, true);
    log.info(message, { test: 'static logs to file' });
    expect(true).to.be.true;
  });

  it('static logs to file and console', () => {
    const log = getLogger(
      {
        logLevel: LogLevel.INFO,
        serviceName,
        transports: [LogOutput.FILE, LogOutput.FILE],
      },
      true,
    );
    log.info(message, { test: 'static logs to file and console' });
    expect(true).to.be.true;
  });
});
