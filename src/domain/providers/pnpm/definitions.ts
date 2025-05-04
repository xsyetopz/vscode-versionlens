import type { CachingOptions } from '#domain/caching';
import type { HttpOptions } from '#domain/clients';
import type { PnpmConfig } from '#domain/providers/pnpm';
import { nameOf } from '#domain/utils';

export enum PnpmFeatures {
  Caching = 'pnpm.caching',
  Http = 'pnpm.http',
  DependencyProperties = 'pnpm.dependencyProperties',
  FilePatterns = 'pnpm.files'
}

export interface IPnpmServices {
  pnpmCachingOpts: CachingOptions
  pnpmHttpOpts: HttpOptions
  pnpmConfig: PnpmConfig
}

export const PnpmService = nameOf<IPnpmServices>()