import { type ILoggerSink, type LogLevelName, LogLevel } from '#domain/logging';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class ConsoleLoggerSink implements ILoggerSink {

  constructor(readonly logLevel: LogLevel) {
    throwUndefinedOrNull('logLevel', logLevel);
  }

  log(level: LogLevel, namespace: string, message: string) {
    const logLevelName = LogLevel[level] as LogLevelName;
    console[logLevelName](logLevelName.toUpperCase(), `[${namespace}]`, message)
  }

  async dispose() { }

}