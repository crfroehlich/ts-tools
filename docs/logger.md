# Logging Client

## Table of Contents

- [Logging Client](#logging-client)
  - [Purpose of the Logging Client](#purpose-of-the-logging-client)
  - [Logging Options](#logging-options)
  - [Example Logger Implementations](#example-logger-implementations)

## Purpose of the Logging Client

The logging client is intended to provide a simple class that can be instantiated and utilized to log information to multiple sources. The logging client relies on [Winston](https://www.npmjs.com/package/winston) to provide a configurable, flexible interface in which NS8 can supply logging components. The Logging Client provides methods for:

- Errors: Logs errors including a Throwable object for context
- Debugging: Logs debugging info
- Warnings: Logs warning generated during runtime
- Info: Logs information set for debugging or performance insight
  The format of the log information, the destination it is sent to, and the log level required for events to be logged are all set via the configuration options passed into the constructor.

## Logging Options

The logger configuration interface allows defining the following options:

- `logLevel`: the maximum level of logging to use, e.g. if the level is INFO then DEBUG logs will not be recorded
- `serviceName`: the unique name of your service or module
- `transports`: currently supports FILE and CONSOLE

## Example Logger Implementations

The following is are examples of instantiating a new logger and using the static logger.

```ts
const log = new Log({
  logLevel: LogLevel.ERROR, // Logs below the ERROR level will not be logged
  serviceName: "my-service-name", // Any service name to use in the log metadata and filename
  transports: [LogOutput.CONSOLE, LogOutput.FILE], // logs to both the console and the file system
});
log.info("My info message"); // Will not be logged
log.error("Fatal exception", { error, ipaddress }); // Will log an error and serialize the JSON param into the log message
```

The following demonstrates usages utilizing the static Logger:

```ts
// The first time you get the static logger, you should specify the configuration.
const log = getLogger({
  logLevel: LogLevel.INFO,
  serviceName: "unit-test",
  transports: [LogOutput.CONSOLE],
});
//Once instantiated, you can get the same instance of the logger by just calling
getLogger().error("My fatal error");
```
