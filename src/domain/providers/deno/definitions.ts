import type { CachingOptions } from '#domain/caching';
import type { HttpOptions, JsonClientResponse } from '#domain/clients';
import type { DenoSuggestionResolver, DenoConfig, JsrClient } from "#domain/providers/deno";
import { nameOf } from '#domain/utils';

export enum DenoFeatures {
  Caching = 'deno.caching',
  Http = 'deno.http',
  DependencyProperties = 'deno.dependencyProperties',
  FilePatterns = 'deno.files',
  OnSaveChangesTask = 'deno.onSaveChanges',
  PrereleaseTagFilter = 'deno.prereleaseTagFilter',
}

export interface IDenoServices {
  denoCachingOpts: CachingOptions
  denoHttpOpts: HttpOptions
  denoConfig: DenoConfig
  jsrClient: JsrClient
  denoClient: DenoSuggestionResolver
}

export const DenoService = nameOf<IDenoServices>()

export type JsrApiResult = {
  latest: string
  versions: {
    [version: string]: {
      yanked?: boolean
    }
  }
}

export type JsrApiResponse = JsonClientResponse<JsrApiResult>

export type JsrClientResponse = JsonClientResponse<string[]>