import {
  type ILogger,
  type ILoggerSink,
  LogLevel
} from '#domain/logging';
import type { Constructor } from '#domain/utils';
import { throwUndefinedOrNull } from '@esm-test/guards';

const loggerRe = /{([a-zA-Z0-9_]+)}/g;

export type LoggerFactory = <T = any>(nameOrClass: string | Constructor<T>) => ILogger;

/**
 * Factory for creating logger instances with a set of shared sinks.
 * @param sinks The collection of sinks to receive log messages.
 */
export function createLoggerFactory(sinks: ILoggerSink[]): LoggerFactory {
  throwUndefinedOrNull('sinks', sinks);

  return nameOrClass => {
    const namespace = typeof nameOrClass === 'string'
      ? nameOrClass
      : nameOrClass.name;

    return new Logger(namespace, sinks);
  }
}

/**
 * Implementation of the ILogger interface that formats messages and sends them to sinks.
 */
export class Logger implements ILogger {

  /**
   * Initializes a new instance of the Logger class.
   * @param namespace The logger namespace.
   * @param sinks The collection of sinks.
   */
  constructor(readonly namespace: string, readonly sinks: ILoggerSink[]) {
    throwUndefinedOrNull('namespace', namespace);
    throwUndefinedOrNull('sinks', sinks);
  }

  /** Logs an error message. */
  error = this.log.bind(this, LogLevel.error);
  /** Logs a warning message. */
  warn = this.log.bind(this, LogLevel.warn);
  /** Logs an informational message. */
  info = this.log.bind(this, LogLevel.info);
  /** Logs a debug message. */
  debug = this.log.bind(this, LogLevel.debug);
  /** Logs a trace message. */
  trace = this.log.bind(this, LogLevel.trace);

  /**
   * Internal log method that filters sinks and formats messages.
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    // filter the sinks to the log level
    const filteredSinks = this.sinks.filter(sink => level >= sink.logLevel);
    if (filteredSinks.length === 0) return;

    let replaceIndex = 0;
    const mergedMsg = message.replaceAll(
      loggerRe,
      (substring: string, ...matches: any[]) => {
        const value = args[replaceIndex++];

        if (typeof value !== 'object') return value;
        if (value instanceof URL) return sanitizeURL(value);
        if (value instanceof Array) return sanitizeArray(value);

        return JSON.stringify(value);
      }
    );

    filteredSinks.forEach(sink => sink.log(level, this.namespace, mergedMsg));
  }
}

/**
 * Sanitizes a URL for logging by masking credentials.
 */
function sanitizeURL(url: URL): string {
  const clone = new URL(url);
  if (clone.username.length > 0) clone.username = '***';
  if (clone.password.length > 0) clone.password = '***';
  return clone.toString();
}

/**
 * Sanitizes an array for logging by masking sensitive data in elements.
 */
function sanitizeArray(values: any[]): string {
  const sanitized = Array.from(
    values,
    value => {
      return value instanceof URL
        ? sanitizeURL(value)
        : value
    }
  );
  return JSON.stringify(sanitized);
}