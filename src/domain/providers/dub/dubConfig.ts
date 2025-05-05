import type { CachingOptions } from '#domain/caching';
import type { HttpOptions } from '#domain/clients';
import type { IFrozenOptions } from '#domain/configuration';
import type { IProviderConfig } from '#domain/providers';
import { DubFeatures } from '#domain/providers/dub';
import { ensureEndSlash } from '#domain/utils';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class DubConfig implements IProviderConfig {

  constructor(
    readonly config: IFrozenOptions,
    readonly caching: CachingOptions,
    readonly http: HttpOptions
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('caching', caching);
    throwUndefinedOrNull('http', http);
  }

  readonly fileLanguage = ['json', 'jsonc'];

  get filePatterns(): string {
    return this.config.get(DubFeatures.FilePatterns, '');
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(DubFeatures.DependencyProperties, []);
  }

  get apiUrl(): string {
    return ensureEndSlash(this.config.get(DubFeatures.ApiUrl, ''));
  }

  get onSaveChangesTask(): string | null {
    return this.config.get(DubFeatures.OnSaveChangesTask, null);
  }

  get prereleaseTagFilter(): Array<string> {
    return this.config.get(DubFeatures.prereleaseTagFilter, []);
  }

}