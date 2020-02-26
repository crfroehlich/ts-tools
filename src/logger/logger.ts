/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger, LoggerOptions, createLogger, format, transports } from 'winston';

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

export class Log {
  logger: Logger;

  constructor(serviceName: string = defaultServiceName, loggerOptions: LoggerOptions = defaultOptions) {
    if (serviceName !== defaultServiceName) {
      // eslint-disable-next-line no-param-reassign
      loggerOptions.defaultMeta.service = serviceName;
    }
    this.logger = createLogger(loggerOptions);

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
