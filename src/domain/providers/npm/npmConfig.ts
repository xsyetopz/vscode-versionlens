import type { CachingOptions } from '#domain/caching';
import type { HttpOptions } from '#domain/clients';
import type { IFrozenOptions } from '#domain/configuration';
import type { IProviderConfig } from '#domain/providers';
import { NpmFeatures } from '#domain/providers/npm';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class NpmConfig implements IProviderConfig {

  constructor(
    readonly config: IFrozenOptions,
    readonly caching: CachingOptions,
    readonly http: HttpOptions
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('caching', caching);
    throwUndefinedOrNull('http', http);
  }

  readonly fileLanguage = ['yaml', 'json', 'jsonc'];

  get filePatterns(): string {
    return this.config.get(NpmFeatures.FilePatterns);
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(NpmFeatures.DependencyProperties);
  }

  get onSaveChangesTask(): string | null {
    return this.config.get(NpmFeatures.OnSaveChangesTask) ?? null;
  }

  get prereleaseTagFilter(): Array<string> {
    return this.config.get(NpmFeatures.PrereleaseTagFilter);
  }

}