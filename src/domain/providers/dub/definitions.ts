import type { CachingOptions } from '#domain/caching';
import type { HttpOptions, JsonClientResponse } from '#domain/clients';
import type { DubClient, DubConfig, DubJsonClient } from '#domain/providers/dub';
import { nameOf } from '#domain/utils';

export enum DubFeatures {
  Caching = 'dub.caching',
  Http = 'dub.http',
  DependencyProperties = 'dub.dependencyProperties',
  ApiUrl = 'dub.apiUrl',
  FilePatterns = 'dub.files',
  OnSaveChangesTask = 'dub.onSaveChanges',
  prereleaseTagFilter = 'dub.prereleaseTagFilter',
}

export interface IDubServices {
  dubCachingOpts: CachingOptions;
  dubHttpOpts: HttpOptions;
  dubConfig: DubConfig;
  dubJsonClient: DubJsonClient;
  dubClient: DubClient;
}

export const DubService = nameOf<IDubServices>()

export type DubApiResult = {
  versions: [{ version }]
}

export type DubJsonClientResponse = JsonClientResponse<string[]>