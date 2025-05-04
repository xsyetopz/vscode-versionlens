import type { IFrozenOptions } from '#domain/configuration';
import type { IProviderConfig } from '#domain/providers';
import { throwUndefinedOrNull } from '@esm-test/guards';
import { CachingOptions } from '#domain/caching';
import { HttpOptions } from '#domain/clients';
import { PnpmFeatures } from './index.js';

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

  get filePatterns(): string {
    return this.config.get(PnpmFeatures.FilePatterns);
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(PnpmFeatures.DependencyProperties);
  }

  onSaveChangesTask: string;

}