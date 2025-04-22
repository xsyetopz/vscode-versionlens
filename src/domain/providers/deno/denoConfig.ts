import type { CachingOptions } from '#domain/caching';
import type { HttpOptions } from '#domain/clients';
import type { IFrozenOptions } from '#domain/configuration';
import type { IProviderConfig } from '#domain/providers';
import { DenoFeatures } from '#domain/providers/deno';
import { nameOf } from '#domain/utils';
import { throwUndefinedOrNull } from '@esm-test/guards';

const def = nameOf<DenoConfig>();

export class DenoConfig implements IProviderConfig {

  constructor(
    readonly config: IFrozenOptions,
    readonly caching: CachingOptions,
    readonly http: HttpOptions
  ) {
    throwUndefinedOrNull(def.config, config);
    throwUndefinedOrNull(def.caching, caching);
    throwUndefinedOrNull(def.http, http);
  }

  readonly fileLanguage = ['json', 'jsonc'];

  get filePatterns(): string {
    return this.config.get(DenoFeatures.FilePatterns);
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(DenoFeatures.DependencyProperties);
  }

  get prereleaseTagFilter(): Array<string> {
    return this.config.get(DenoFeatures.PrereleaseTagFilter);
  }

  get onSaveChangesTask(): string | null {
    return this.config.get(DenoFeatures.OnSaveChangesTask) ?? null;
  }

}