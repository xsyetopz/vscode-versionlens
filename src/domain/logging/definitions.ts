import { LoggingOptions } from '#domain/logging';

export enum LoggingFeatures {
  LoggingLevel = 'level',
}

export enum LogLevelTypes {
  Error = "error",
  Info = "info",
  Debug = "debug",
  Silly = "silly"
}

export type TChildLoggerOptions = {
  logGroup: string;
};

export interface ILogger {
  log(level: LogLevelTypes, message: string, ...splats: any): void;
  error(message: string, ...splats: any): void;
  warn(message: string, ...splats: any): void;
  info(message: string, ...splats: any): void;
  debug(message: string, ...splats: any): void;
  silly(message: string, ...splats: any): void;
  child(options: TChildLoggerOptions): ILogger;
}

export interface ILoggerChannel {
  name: string;
  logging: LoggingOptions;
  refreshLoggingLevel(): void;
}