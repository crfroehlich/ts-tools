/* eslint-disable
  @typescript-eslint/no-explicit-any,
  no-unused-expressions,
*/
import { ILogObject, ISettingsParam, Logger } from 'tslog';
import { appendFileSync } from 'fs';

/**
 * NOTE: these properties need to be explicitly exported for downstream consumers.
 * Since they come from a 3rd party library, we can safely ignore them from code coverage.
 */
export {
  /* istanbul ignore next */
  Logger,
  /* istanbul ignore next */
  ISettingsParam,
  /* istanbul ignore next */
  ILogObject,
} from 'tslog';

/**
 * The valid log levels
 * @remarks These log levels conform to standard log level definitions
 * @public
 */
export enum LogLevel {
  SILLY = 'silly',
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * The valid output locations for logs
 * @remarks Additional output locations will be enabled in the future
 * @public
 */
export enum TransportType {
  CONSOLE = 'console',
  FILE = 'file',
  NONE = 'none',
  API = 'api',
}

export interface Transports {
  type: TransportType;
  logLevel: LogLevel;
}

/**
 * Configuration options for instantiating the Log
 * @public
 */
export interface LogOptions {
  /**
   * The service name to use for log metadata and file names
   */
  serviceName: string;
  /**
   * The minimum log level to capture
   */
  logLevel: LogLevel;
  /**
   * An optional collection of all required output targets
   */
  transports?: Transports[];
}

/**
 * The default configuration if none is provided.
 * @defaultValue {@link LogLevel.ERROR} and {@link LogOutput.FILE}
 * @internal
 */
export const DefaultLogOptions: ISettingsParam = {
  displayInstanceName: true,
  displayFunctionName: true,
  displayLogLevel: true,
  displayLoggerName: true,
  name: 'js-tools',
  setCallerAsLoggerName: true,
  minLevel: LogLevel.ERROR,
  printLogMessageInNewLine: true,
  overwriteConsole: true,
};

/**
 * Constructs a tslog LoggerOptions object based on the provided options
 * @internal
 * @param options - log options
 * @returns ISettingsParam
 */
export const buildLoggerConfig = (options?: LogOptions): ISettingsParam => {
  const ret = DefaultLogOptions;
  if (options?.serviceName) {
    ret.name = options.serviceName;
  }
  if (options?.logLevel) {
    ret.minLevel = options.logLevel;
  }
  return ret;
};

/**
 * Type signature for log method
 * @public
 */
export type logMethod = (level: LogLevel, message: string, ...args: any[]) => void;

/**
 * Type signature for info method
 * @public
 */
export type infoMethod = (message: string, ...args: any[]) => void;

/**
 * Type signature for error method
 * @public
 */
export type errorMethod = (message: string, error: Error, ...args: any[]) => void;

/**
 * Definition of logging implementation requirements
 * @public
 */
export interface LogInterface {
  /**
   * Allows logging at any desired log level
   * @param level - the log level to use (DEBUG, INFO, WARN, ERROR)
   * @param message - a brief description of the issue
   * @param args - any number of additional string messages, which will be joined together or a JSON object
   * @returns void
   */
  log: logMethod;

  /**
   * Generates an INFO log
   * @param message - a brief description of the issue
   * @param args - any number of additional string messages, which will be joined together or a JSON object
   * @returns void
   */
  debug: infoMethod;

  /**
   * Generates an INFO log
   * @param message - a brief description of the issue
   * @param args - any number of additional string messages, which will be joined together or a JSON object
   * @returns void
   */
  info: infoMethod;

  /**
   * Generates an WARN log
   * @param message - a brief description of the issue
   * @param args - any number of additional string messages, which will be joined together or a JSON object
   * @returns void
   */
  warn: infoMethod;

  /**
   * Generates an ERROR log
   * @param message - a brief description of the issue
   * @param args - any number of additional string messages, which will be joined together or a JSON object
   * @returns void
   */
  error: errorMethod;

  /**
   * Generates an FATAL log
   * @param message - a brief description of the issue
   * @param args - any number of additional string messages, which will be joined together or a JSON object
   * @returns void
   */
  fatal: errorMethod;
}

/**
 * {@inheritDoc LogInterface}
 * @public
 */
export class Log implements LogInterface {
  logger: Logger;

  /**
   * @param logOptions - optional configuration options for the logger
   */
  constructor(logOptions?: LogOptions) {
    const config = buildLoggerConfig(logOptions);
    this.logger = new Logger(config);

    logOptions?.transports
      ?.filter((t) => t.type === TransportType.FILE)
      .forEach((t) => {
        const logToFile = (logObject: ILogObject) => {
          appendFileSync(`${config.name}_${t.logLevel}.log`, `${JSON.stringify(logObject)}\n`);
        };
        this.logger.attachTransport(
          {
            silly: logToFile,
            debug: logToFile,
            trace: logToFile,
            info: logToFile,
            warn: logToFile,
            error: logToFile,
            fatal: logToFile,
          },
          t.logLevel,
        );
      });
  }

  /**
   * {@inheritDoc LogInterface.log}
   */
  public log = (level: LogLevel, message: string, ...args: any[]): void => {
    try {
      this.logger[level](message, ...args);
      // eslint-disable-next-line no-empty
    } catch {}
  };

  /**
   * {@inheritDoc LogInterface.info}
   */
  public debug = (message: string, ...args: any[]): void => {
    this.log(LogLevel.DEBUG, message, ...args);
  };

  /**
   * {@inheritDoc LogInterface.info}
   */
  public info = (message: string, ...args: any[]): void => {
    this.log(LogLevel.INFO, message, ...args);
  };

  /**
   * {@inheritDoc LogInterface.info}
   */
  public warn = (message: string, ...args: any[]): void => {
    this.log(LogLevel.WARN, message, ...args);
  };

  /**
   * {@inheritDoc LogInterface.error}
   */
  public error = (message: string, error: Error, ...args: any[]): void => {
    this.log(LogLevel.ERROR, message, error, ...args);
  };

  /**
   * {@inheritDoc LogInterface.error}
   */
  public fatal = (message: string, error: Error, ...args: any[]): void => {
    this.log(LogLevel.FATAL, message, error, ...args);
  };
}

/**
 * Internal handle on a static instance of a logger
 * @internal
 */
let staticLogger: LogInterface;

/**
 * Fetches a static instance of a logger.
 * @remarks The returned logger will always be the same instance, with the same configuration.
 * @public
 * @param logOptions - optional configuration options for the logger
 * @param reset - reset the static instance with a new configuration
 */
export const getLogger = (logOptions?: LogOptions, reset = false): LogInterface => {
  if (reset) staticLogger = new Log(logOptions);
  /* istanbul ignore next */
  staticLogger = staticLogger || new Log(logOptions);
  return staticLogger;
};
