import type { CachingOptions } from '#domain/caching';
import type { HttpOptions } from '#domain/clients';
import type { IFrozenOptions } from '#domain/configuration';
import type { IProviderConfig } from '#domain/providers';
import { GoFeatures } from '#domain/providers/golang';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class GoConfig implements IProviderConfig {

  constructor(
    readonly config: IFrozenOptions,
    readonly caching: CachingOptions,
    readonly http: HttpOptions
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('caching', caching);
    throwUndefinedOrNull('http', http);
  }

  readonly fileLanguage = 'go.mod';

  get filePatterns(): string {
    return this.config.get(GoFeatures.FilePatterns, '');
  }

  get prereleaseTagFilter(): Array<string> {
    return this.config.get(GoFeatures.PrereleaseTagFilter, []);
  }

  get apiUrl(): string {
    return this.config.get(GoFeatures.ApiUrl, '');
  }

  get onSaveChangesTask(): string | null {
    return this.config.get(GoFeatures.OnSaveChangesTask, null);
  }

}