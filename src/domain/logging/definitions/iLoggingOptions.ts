import { IFrozenOptions } from '#domain/configuration';
import { LogLevelTypes } from "#domain/logging";

export interface ILoggingOptions extends IFrozenOptions {

  level: LogLevelTypes;

  timestampFormat: string;

}