import { type IFrozenOptions, Options } from '#domain/configuration';
import type { Nullable } from '#domain/utils';

export class OptionsWithFallback extends Options {

  protected fallbackSection: Nullable<string>;

  constructor(config: IFrozenOptions, section: string, fallbackSection: Nullable<string> = null) {
    super(config, section);
    this.fallbackSection = fallbackSection;
  }

  get<T>(key: string): T | undefined {
    // attempt to get the section value
    const sectionValue = this.config.get<T>(`${this.section}${key}`);

    // return section value
    if (sectionValue !== null && sectionValue !== undefined) return sectionValue;

    // attempt to get fallback section value
    let fallbackSectionValue: T | undefined;
    if (this.fallbackSection !== null) {
      fallbackSectionValue = this.config.get(`${this.fallbackSection}.${key}`);
    }

    // return fallback key value
    return fallbackSectionValue;
  }

}