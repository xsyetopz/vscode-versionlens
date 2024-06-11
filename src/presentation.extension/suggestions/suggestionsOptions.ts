import { IConfig } from '#domain/configuration';
import { KeyDictionary } from '#domain/utils';
import { throwUndefinedOrNull } from '@esm-test/guards';
import { SuggestionFeatures } from '#extension';

export class SuggestionsOptions {

  constructor(readonly config: IConfig) {
    throwUndefinedOrNull("config", config);
  }

  get showOnStartup(): boolean {
    return this.config.get<boolean>(
      SuggestionFeatures.ShowOnStartup
    ) || false;
  }

  get showPrereleasesOnStartup(): boolean {
    return this.config.get<boolean>(
      SuggestionFeatures.ShowPrereleasesOnStartup
    ) || false;
  }

  get indicators(): KeyDictionary<string> {
    return this.config.get<KeyDictionary<string>>(
      SuggestionFeatures.Indicators
    );
  }

}