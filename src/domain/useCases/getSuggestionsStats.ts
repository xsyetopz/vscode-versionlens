import type { ILogger } from '#domain/logging';
import { type DependencyCache, SuggestionCategory, SuggestionTypes } from '#domain/packages';
import type { ISuggestionProvider } from '#domain/providers';
import type { GetSuggestions } from '#domain/useCases';
import { Disposable } from '#domain/utils';
import { throwUndefinedOrNull } from '@esm-test/guards';

export type SuggestionsStats = {
  noMatches: number
  updates: number
  errors: number
}

export class GetSuggestionsStats extends Disposable {

  constructor(
    readonly providers: ISuggestionProvider[],
    readonly dependencyCache: DependencyCache,
    readonly getSuggestions: GetSuggestions,
    readonly logger: ILogger
  ) {
    super();
    throwUndefinedOrNull('providers', providers);
    throwUndefinedOrNull('dependencyCache', dependencyCache);
    throwUndefinedOrNull('getSuggestions', getSuggestions);
    throwUndefinedOrNull('logger', logger);
  }

  async execute(): Promise<SuggestionsStats> {
    const map = this.providers.flatMap(
      provider => {
        const filePathCache = this.dependencyCache.providerMaps[provider.name];
        const filePaths = [...filePathCache.keys()];
        return filePaths.map(filePath => ({ provider, filePath }));
      }
    );

    let noMatches = 0
    let updates = 0
    let errors = 0
    for (const { provider, filePath } of map) {
      this.logger.debug("Fetching suggestion stats for {PackageFilePath}", filePath)
      const suggestions = await this.getSuggestions.execute(
        provider,
        filePath,
        filePath,
        false
      );

      const statuses = suggestions
        .filter(x => x.suggestion.type === SuggestionTypes.status)
        .map(x => x.suggestion);

      for (const status of statuses) {
        const cat = status.category;
        if (cat === SuggestionCategory.NoMatch)
          noMatches++;
        else if (cat === SuggestionCategory.Error)
          errors++;
        else if (cat !== SuggestionCategory.Latest && cat !== SuggestionCategory.Directory)
          updates++;
      }
    }

    return { errors, noMatches, updates }
  }

}