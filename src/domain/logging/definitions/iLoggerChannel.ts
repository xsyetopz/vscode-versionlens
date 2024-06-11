import { ILoggingOptions } from "#domain/logging";

export interface ILoggerChannel {

  name: string;

  logging: ILoggingOptions;

  refreshLoggingLevel(): void;

}