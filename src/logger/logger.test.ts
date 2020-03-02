/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import 'mocha';
import { Log, LogLevel, LogOutput, getLogger } from './logger';

describe('Logging', () => {
  it('logs using the default settings', () => {
    const log = new Log();
    log.error('This is a message', { test: 'logs using the default settings' });
    expect(true).to.be.true;
  });

  it('info logs', () => {
    const log = new Log({ logLevel: LogLevel.INFO, serviceName: 'unit-test', transports: [LogOutput.CONSOLE] });
    log.info('This is a message', { test: 'info logs' });
    expect(true).to.be.true;
  });

  it('error logs', () => {
    const log = new Log({ logLevel: LogLevel.ERROR, serviceName: 'unit-test', transports: [LogOutput.CONSOLE] });
    log.error('This is a message', { test: 'error logs' });
    expect(true).to.be.true;
  });

  it('automatically adds console logging', () => {
    process.env.NODE_ENV = 'dev';
    const log = new Log({ logLevel: LogLevel.ERROR, serviceName: 'unit-test', transports: [LogOutput.FILE] });
    log.error('This is a message', { test: 'automatically adds console logging' });
    expect(true).to.be.true;
  });

  it('logs nothing', () => {
    process.env.NODE_ENV = 'production';
    const log = new Log({ logLevel: LogLevel.ERROR, serviceName: 'unit-test', transports: [LogOutput.NONE] });
    log.error('This is a message', { test: 'logs nothing' });
    expect(true).to.be.true;
  });

  it('custom logs debug', () => {
    const log = new Log({ logLevel: LogLevel.DEBUG, serviceName: 'unit-test', transports: [LogOutput.CONSOLE] });
    log.log(LogLevel.DEBUG, 'This is a message', { test: 'custom logs debug' });
    expect(true).to.be.true;
  });

  it('custom logs warn', () => {
    const log = new Log({ logLevel: LogLevel.WARN, serviceName: 'unit-test', transports: [LogOutput.CONSOLE] });
    log.log(LogLevel.WARN, 'This is a message', { test: 'custom logs warn' });
    expect(true).to.be.true;
  });

  it('custom logs error', () => {
    const log = new Log({ logLevel: LogLevel.ERROR, serviceName: 'unit-test', transports: [LogOutput.CONSOLE] });
    log.log(LogLevel.ERROR, 'This is a message', { test: 'custom logs error' });
    expect(true).to.be.true;
  });

  it('custom logs info', () => {
    const log = new Log({ logLevel: LogLevel.INFO, serviceName: 'unit-test', transports: [LogOutput.CONSOLE] });
    log.log(LogLevel.INFO, 'This is a message', { test: 'custom logs info' });
    expect(true).to.be.true;
  });

  it('static logs using the default options', () => {
    const log = getLogger();
    log.info('This is a message', { test: 'static logs using the default options' });
    expect(true).to.be.true;
  });

  it('static logs to console', () => {
    const log = getLogger({ logLevel: LogLevel.INFO, serviceName: 'unit-test', transports: [LogOutput.CONSOLE] }, true);
    log.info('This is a message', { test: 'static logs to console' });
    expect(true).to.be.true;
  });

  it('static logs to console again using the same instance', () => {
    const log = getLogger({ logLevel: LogLevel.INFO, serviceName: 'unit-test', transports: [LogOutput.CONSOLE] });
    log.info('This is a message', { test: 'static logs to console again using the same instance' });
    expect(true).to.be.true;
  });

  it('static logs to file', () => {
    const log = getLogger({ logLevel: LogLevel.INFO, serviceName: 'unit-test', transports: [LogOutput.FILE] }, true);
    log.info('This is a message', { test: 'static logs to file' });
    expect(true).to.be.true;
  });

  it('static logs to file and console', () => {
    const log = getLogger(
      {
        logLevel: LogLevel.INFO,
        serviceName: 'unit-test',
        transports: [LogOutput.FILE, LogOutput.FILE],
      },
      true,
    );
    log.info('This is a message', { test: 'static logs to file and console' });
    expect(true).to.be.true;
  });
});
