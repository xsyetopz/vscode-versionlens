import { HttpFeatures } from '#domain/clients';
import { type IFrozenOptions, OptionsWithFallback } from '#domain/configuration';
import type { Nullable } from '#domain/utils';

export class HttpOptions extends OptionsWithFallback {

  constructor(
    config: IFrozenOptions,
    section: string,
    fallbackSection: Nullable<string> = null
  ) {
    super(config, section, fallbackSection);
  }

  get strictSSL(): boolean {
    return this.getOrDefault<boolean>(
      HttpFeatures.StrictSSL,
      true
    );
  }

}