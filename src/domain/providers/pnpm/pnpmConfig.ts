import type { CachingOptions } from '#domain/caching';
import type { HttpOptions } from '#domain/clients';
import type { IFrozenOptions } from '#domain/configuration';
import type { IProviderConfig } from '#domain/providers';
import { PnpmFeatures } from '#domain/providers/pnpm';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class PnpmConfig implements IProviderConfig {

  constructor(
    readonly config: IFrozenOptions,
    readonly caching: CachingOptions,
    readonly http: HttpOptions
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('caching', caching);
    throwUndefinedOrNull('http', http);
  }

  readonly fileLanguage = ['yaml'];

  onSaveChangesTask = null;

  get filePatterns(): string {
    return this.config.get(PnpmFeatures.FilePatterns, '');
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(PnpmFeatures.DependencyProperties, []);
  }

}