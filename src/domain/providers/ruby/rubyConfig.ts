import type { CachingOptions } from '#domain/caching';
import type { HttpOptions } from '#domain/clients';
import type { IFrozenOptions } from '#domain/configuration';
import type { IProviderConfig } from '#domain/providers';
import { RubyFeatures } from '#domain/providers/ruby';
import { throwUndefinedOrNull } from '@esm-test/guards';

/**
 * Configuration for the Ruby package provider.
 */
export class RubyConfig implements IProviderConfig {

  /**
   * Initializes a new instance of the RubyConfig class.
   * @param config The frozen options from the configuration.
   * @param caching The caching options for Ruby.
   * @param http The HTTP options for Ruby.
   */
  constructor(
    readonly config: IFrozenOptions,
    readonly caching: CachingOptions,
    readonly http: HttpOptions
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('caching', caching);
    throwUndefinedOrNull('http', http);
  }

  /**
   * The file languages supported by this provider.
   */
  readonly fileLanguage = ['ruby', 'plaintext'];

  /**
   * Gets the file patterns used to identify Ruby files (e.g., Gemfile).
   */
  get filePatterns(): string {
    return this.config.get(RubyFeatures.FilePatterns, '');
  }

  /**
   * Gets the property names that contain dependencies in Ruby files.
   */
  get dependencyProperties(): Array<string> {
    return [];
  }

  /**
   * Gets the filters used for prerelease tags.
   */
  get prereleaseTagFilter(): Array<string> {
    return this.config.get(RubyFeatures.PrereleaseTagFilter, []);
  }

  /**
   * Gets the base API URL for the Ruby registry.
   */
  get apiUrl(): string {
    return this.config.get(RubyFeatures.ApiUrl, '');
  }

  /**
   * Gets the task to run when a Ruby file is saved.
   */
  get onSaveChangesTask(): string | null {
    return this.config.get(RubyFeatures.OnSaveChangesTask, null);
  }

}
