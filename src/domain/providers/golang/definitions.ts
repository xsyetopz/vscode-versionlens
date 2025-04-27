import type { CachingOptions } from '#domain/caching';
import type { HttpOptions, JsonClientResponse } from '#domain/clients';
import type { GoConfig, GoHttpClient, GoSuggestionResolver } from '#domain/providers/golang';
import { nameOf } from '#domain/utils';

export enum GoFeatures {
  Caching = 'golang.caching',
  Http = 'golang.http',
  ApiUrl = 'golang.apiUrl',
  FilePatterns = 'golang.files',
  OnSaveChangesTask = 'golang.onSaveChanges',
  PrereleaseTagFilter = 'golang.prereleaseTagFilter',
}

export interface IGoService {
  goCachingOpts: CachingOptions;
  goHttpOpts: HttpOptions;
  goConfig: GoConfig;
  goHttpClient: GoHttpClient;
  goSuggestionResolver: GoSuggestionResolver;
}

export const GoService = nameOf<IGoService>()

export type GoApiClientResult = {
  versions: string[]
}

export type GoApiClientResponse = JsonClientResponse<GoApiClientResult>