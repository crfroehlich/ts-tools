/* eslint-disable no-unused-expressions */
import { SdkTestAssertionType, testSdkAssertion } from '../testRunner/testSdk';
import { Log, LogLevel, LogOutput, getLogger } from './logger';

const serviceName = 'unit-test';
const message = 'This is a message';
const error = new Error(message);

testSdkAssertion({
  name: 'Logger Suite',
  assertions: [
    {
      name: 'logs using the default settings',
      assertionFunction: async () => {
        const log = new Log();
        return log.error(message, error, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'info logs',
      assertionFunction: async () => {
        const log = new Log({
          logLevel: LogLevel.INFO,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        return log.info(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'error logs',
      assertionFunction: async () => {
        const log = new Log({
          logLevel: LogLevel.ERROR,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        return log.error(message, error, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'debug logs',
      assertionFunction: async () => {
        const log = new Log({
          logLevel: LogLevel.DEBUG,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        return log.debug(message, error, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'warn logs',
      assertionFunction: async () => {
        const log = new Log({
          logLevel: LogLevel.WARN,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        return log.warn(message, error, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'fatal logs',
      assertionFunction: async () => {
        const log = new Log({
          logLevel: LogLevel.FATAL,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        return log.fatal(message, error, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'automatically adds console logging',
      assertionFunction: async () => {
        process.env.NODE_ENV = 'dev';
        const log = new Log({
          logLevel: LogLevel.ERROR,
          serviceName,
          transports: [LogOutput.FILE],
        });
        return log.error(message, error, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'logs nothing',
      assertionFunction: async () => {
        process.env.NODE_ENV = 'production';
        const log = new Log({
          logLevel: LogLevel.ERROR,
          serviceName,
          transports: [LogOutput.NONE],
        });
        return log.error(message, error, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'custom logs debug',
      assertionFunction: async () => {
        const log = new Log({
          logLevel: LogLevel.DEBUG,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        return log.log(LogLevel.DEBUG, message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'custom logs warn',
      assertionFunction: async () => {
        const log = new Log({
          logLevel: LogLevel.WARN,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        return log.log(LogLevel.WARN, message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'custom logs error',
      assertionFunction: async () => {
        const log = new Log({
          logLevel: LogLevel.ERROR,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        return log.log(LogLevel.ERROR, message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'custom logs info',
      assertionFunction: async () => {
        const log = new Log({
          logLevel: LogLevel.INFO,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        return log.log(LogLevel.INFO, message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs using the default options',
      assertionFunction: async () => {
        const log = getLogger();
        return log.info(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs to console',
      assertionFunction: async () => {
        const log = getLogger({ logLevel: LogLevel.INFO, serviceName, transports: [LogOutput.CONSOLE] }, true);
        return log.info(message, { test: 'static logs to console' });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs to console again using the same instance',
      assertionFunction: async () => {
        const log = getLogger({
          logLevel: LogLevel.INFO,
          serviceName,
          transports: [LogOutput.CONSOLE],
        });
        return log.info(message, {
          test: 'static logs to console again using the same instance',
        });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs to file',
      assertionFunction: async () => {
        const log = getLogger({ logLevel: LogLevel.INFO, serviceName, transports: [LogOutput.FILE] }, true);
        return log.info(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs to file and console',
      assertionFunction: async () => {
        const log = getLogger({ logLevel: LogLevel.INFO, serviceName, transports: [LogOutput.FILE] }, true);
        return log.info(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
  ],
});
