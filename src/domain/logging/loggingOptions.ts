import { IFrozenOptions, Options } from '#domain/configuration';
import { ILoggingOptions, LoggingFeatures, LogLevelTypes } from '#domain/logging';

export class LoggingOptions extends Options implements ILoggingOptions {

  constructor(config: IFrozenOptions, section: string) {
    super(config, section);
  }

  get level(): LogLevelTypes {
    return super.get<LogLevelTypes>(
      LoggingFeatures.LoggingLevel
    ) || LogLevelTypes.Error;
  }

  get timestampFormat(): string { return 'YYYY-MM-DD HH:mm:ss' }

}