/* eslint-disable no-unused-expressions */
import { SdkTestAssertionType, testSdkAssertion } from '../testRunner/testSdk';
import { Log, LogLevel, LogOutput, getLogger } from './logger';

const serviceName = 'unit-test';
const message = 'This is a message';

testSdkAssertion({
  name: 'Logger Suite',
  assertions: [
    {
      name: 'logs using the default settings',
      conversionFunction: () => {
        const log = new Log();
        log.error(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'info logs',
      conversionFunction: () => {
        const log = new Log({
          logLevel: LogLevel.INFO,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        log.info(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'error logs',
      conversionFunction: () => {
        const log = new Log({
          logLevel: LogLevel.ERROR,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        log.error(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'automatically adds console logging',
      conversionFunction: () => {
        process.env.NODE_ENV = 'dev';
        const log = new Log({
          logLevel: LogLevel.ERROR,
          serviceName,
          transports: [LogOutput.FILE],
        });
        log.error(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'logs nothing',
      conversionFunction: () => {
        process.env.NODE_ENV = 'production';
        const log = new Log({
          logLevel: LogLevel.ERROR,
          serviceName,
          transports: [LogOutput.NONE],
        });
        log.error(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'custom logs debug',
      conversionFunction: () => {
        const log = new Log({
          logLevel: LogLevel.DEBUG,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        log.log(LogLevel.DEBUG, message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'custom logs warn',
      conversionFunction: () => {
        const log = new Log({
          logLevel: LogLevel.WARN,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        log.log(LogLevel.WARN, message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'custom logs error',
      conversionFunction: () => {
        const log = new Log({
          logLevel: LogLevel.ERROR,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        log.log(LogLevel.ERROR, message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'custom logs info',
      conversionFunction: () => {
        const log = new Log({
          logLevel: LogLevel.INFO,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        log.log(LogLevel.INFO, message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs using the default options',
      conversionFunction: () => {
        const log = getLogger();
        log.info(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs to console',
      conversionFunction: () => {
        const log = getLogger({ logLevel: LogLevel.INFO, serviceName, transports: [LogOutput.CONSOLE] }, true);
        log.info(message, { test: 'static logs to console' });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs to console again using the same instance',
      conversionFunction: () => {
        const log = getLogger({
          logLevel: LogLevel.INFO,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        log.info(message, {
          test: 'static logs to console again using the same instance',
        });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs to file',
      conversionFunction: () => {
        const log = getLogger({ logLevel: LogLevel.INFO, serviceName, transports: [LogOutput.FILE] }, true);
        log.info(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs to file and console',
      conversionFunction: () => {
        const log = getLogger({ logLevel: LogLevel.INFO, serviceName, transports: [LogOutput.FILE] }, true);
        log.info(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
  ],
});
