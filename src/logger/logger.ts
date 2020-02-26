/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger, LoggerOptions, createLogger, format, transports } from 'winston';
import { loadEnv } from '../env/loadEnv';

loadEnv();

const defaultServiceName = 'js-sdk-log';

const defaultOptions: LoggerOptions = {
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: defaultServiceName },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
};

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum LogTransports {
  CONSOLE = 'console',
  FILE = 'file',
}

export interface LogOptions {
  serviceName: string;
  logLevel: LogLevel;
  transports: LogTransports[];
}

export const DefaultLogOptions: LogOptions = {
  serviceName: 'js-tools',
  logLevel: LogLevel.ERROR,
  transports: [LogTransports.FILE],
};

export const buildLoggerConfig = (options: LogOptions): LoggerOptions => {
  const loggerOptions: LoggerOptions = {
    level: options.logLevel,
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    ),
    defaultMeta: { service: options.serviceName },
  };
  return loggerOptions;
};

export class Log {
  logger: Logger;

  constructor(logOptions: LogOptions = DefaultLogOptions) {
    const loggerConfig = buildLoggerConfig(logOptions);
    this.logger = createLogger(loggerConfig);

    if (logOptions.transports.find((t) => t === LogTransports.FILE)) {
      this.logger.add(new transports.File({ filename: `error.log`, level: 'error' }));
    }

    //
    // If we're not in production then **ALSO** log to the `console`
    // with the colorized simple format.
    //
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
          handleExceptions: true,
        }),
      );
    }
  }

  public log = (level: string, message: string, ...args: any[]): void => {
    this.logger.log(level, message, ...args);
  };

  public info = (message: string, ...args: any[]): void => {
    this.logger.info(message, ...args);
  };

  public error = (message: string, ...args: any[]): void => {
    this.logger.log('error', message, ...args);
  };
}
