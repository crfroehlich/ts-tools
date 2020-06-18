/* eslint-disable
  no-unused-expressions,
  sonarjs/no-identical-functions,
*/
import { SdkTestAssertionType, testSdkAssertion } from '../testRunner/testSdk';
import { Log, LogLevel, TransportType, getLogger } from './logger';

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
          transports: [{ type: TransportType.CONSOLE, logLevel: LogLevel.INFO }],
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
          transports: [{ type: TransportType.CONSOLE, logLevel: LogLevel.ERROR }],
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
          transports: [{ type: TransportType.CONSOLE, logLevel: LogLevel.DEBUG }],
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
          transports: [{ type: TransportType.CONSOLE, logLevel: LogLevel.WARN }],
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
          transports: [{ type: TransportType.CONSOLE, logLevel: LogLevel.FATAL }],
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
          transports: [{ type: TransportType.FILE, logLevel: LogLevel.ERROR }],
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
          transports: [{ type: TransportType.NONE, logLevel: LogLevel.ERROR }],
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
          transports: [{ type: TransportType.CONSOLE, logLevel: LogLevel.DEBUG }],
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
          transports: [{ type: TransportType.CONSOLE, logLevel: LogLevel.WARN }],
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
          transports: [{ type: TransportType.CONSOLE, logLevel: LogLevel.ERROR }],
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
          transports: [{ type: TransportType.CONSOLE, logLevel: LogLevel.INFO }],
        });
        return log.log(LogLevel.INFO, message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs using the default options',
      assertionFunction: async () => {
        const log = getCliLogger('js-tools/test');
        return log.info(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs to console',
      assertionFunction: async () => {
        const log = getLogger(
          {
            logLevel: LogLevel.INFO,
            serviceName,
            transports: [{ type: TransportType.CONSOLE, logLevel: LogLevel.INFO }],
          },
          true,
        );
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
          transports: [{ type: TransportType.CONSOLE, logLevel: LogLevel.INFO }],
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
        const log = getLogger(
          { logLevel: LogLevel.INFO, serviceName, transports: [{ type: TransportType.FILE, logLevel: LogLevel.INFO }] },
          true,
        );
        return log.info(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
    {
      name: 'static logs to file and console',
      assertionFunction: async () => {
        const log = getLogger(
          {
            logLevel: LogLevel.INFO,
            serviceName,
            transports: [
              { type: TransportType.FILE, logLevel: LogLevel.INFO },
              { type: TransportType.CONSOLE, logLevel: LogLevel.INFO },
            ],
          },
          true,
        );
        return log.info(message, { test: message });
      },
      assertion: SdkTestAssertionType.TO_NOT_THROW,
    },
  ],
});
