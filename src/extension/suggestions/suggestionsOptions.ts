import { type IFrozenOptions, OptionsWithFallback } from '#domain/configuration';
import type { SuggestionCategory } from '#domain/packages';
import { type Nullable } from '#domain/utils';
import { SuggestionFeatures } from '#extension';

/**
 * Accessor for suggestion-related configuration options.
 */
export class SuggestionsOptions extends OptionsWithFallback {

  /**
   * Initializes a new instance of the SuggestionsOptions class.
   * @param config The frozen options from the configuration.
   * @param section The configuration section name.
   * @param fallbackSection The fallback configuration section name.
   */
  constructor(
    config: IFrozenOptions,
    section: string,
    fallbackSection: Nullable<string> = null
  ) {
    super(config, section, fallbackSection);
  }

  /** Gets whether to show version lenses on extension startup. */
  get showOnStartup(): boolean {
    return this.getOrDefault<boolean>(
      SuggestionFeatures.ShowOnStartup,
      false
    );
  }

  /** Gets whether to show prerelease versions on extension startup. */
  get showPrereleasesOnStartup(): boolean {
    return this.getOrDefault<boolean>(
      SuggestionFeatures.ShowPrereleasesOnStartup,
      false
    );
  }

  /** Gets whether to show suggestion statistics in the status bar. */
  get showSuggestionsStats(): boolean {
    return this.getOrDefault<boolean>(
      SuggestionFeatures.ShowSuggestionsStats,
      true
    );
  }

  /** Gets whether to show the custom install icon in the editor toolbar. */
  get showCustomInstallAction(): boolean {
    return this.getOrDefault<boolean>(
      SuggestionFeatures.ShowCustomInstallAction,
      false
    );
  }

  /** Gets whether to show the alphabetical sort icon in the editor toolbar. */
  get showSortAlphabeticallyAction(): boolean {
    return this.getOrDefault<boolean>(
      SuggestionFeatures.ShowSortAlphabeticallyAction,
      false
    );
  }

  /** Gets the indicators used for different suggestion categories. */
  get indicators(): Record<SuggestionCategory, string> {
    return this.get(SuggestionFeatures.Indicators)!;
  }

  /** Gets whether to show vulnerabilities. */
  get showVulnerabilities(): boolean {
    return this.getOrDefault<boolean>(
      SuggestionFeatures.ShowVulnerabilities,
      true
    );
  }

}