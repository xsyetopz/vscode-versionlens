import type { CachingOptions } from '#domain/caching';
import type { HttpOptions, JsonClientResponse } from '#domain/clients';
import type { PypiConfig, PypiHttpClient, PypiSuggestionResolver } from '#domain/providers/pypi';
import { nameOf } from '#domain/utils';

export enum PypiFeatures {
  Caching = 'pypi.caching',
  Http = 'pypi.http',
  DependencyProperties = 'pypi.dependencyProperties',
  ApiUrl = 'pypi.apiUrl',
  FilePatterns = 'pypi.files',
  OnSaveChangesTask = 'pypi.onSaveChanges',
  PrereleaseTagFilter = 'pypi.prereleaseTagFilter',
}

export interface IPypiServices {
  pypiCachingOpts: CachingOptions;
  pypiHttpOpts: HttpOptions;
  pypiConfig: PypiConfig;
  pypiHttpClient: PypiHttpClient;
  pypiSuggestionResolver: PypiSuggestionResolver;
}

export const PypiService = nameOf<IPypiServices>()

export type PypiHttpClientResponse = JsonClientResponse<string[]>