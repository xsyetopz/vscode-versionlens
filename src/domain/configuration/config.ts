import type { ConfigSectionResolver, IConfig, IFrozenOptions } from '#domain/configuration';
import { throwNotStringOrEmpty, throwUndefinedOrNull } from '@esm-test/guards';

/**
 * Configuration container.
 * 
 * Caches the configuration which can improve performance. i.e. when reading from a file source.
 * 
 * Can be defrosted using defrost() to fetch most recent settings from the source.
 */
export class Config implements IFrozenOptions {

  constructor(resolver: ConfigSectionResolver, section: string) {
    throwUndefinedOrNull('resolver', resolver);
    throwNotStringOrEmpty('section', section);

    this.resolver = resolver;
    this.section = section;
    this.frozen = null;
  }

  /**
   * Cached configuration
   */
  protected frozen: IConfig | null;

  /**
   * The section key fetched from the configuration source data
   * 
   * @example `versionlens`
   */
  section: string;

  /**
   * The function that reads from the configuration source
   */
  resolver: ConfigSectionResolver;

  get<T>(key: string, defaultValue?: T): T | undefined {
    if (this.frozen === null) {
      this.frozen = this.resolver(this.section);
    }

    return this.frozen.get(key, defaultValue);
  }

  defrost() {
    this.frozen = null;
  }

}