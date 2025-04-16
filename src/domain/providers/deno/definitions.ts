import { CachingOptions } from '#domain/caching';
import { HttpOptions, IJsonHttpClient } from '#domain/clients';
import { DenoClient, DenoConfig, JsrClient } from "#domain/providers/deno";

export enum DenoFeatures {
  Caching = 'deno.caching',
  Http = 'deno.http',
  DependencyProperties = 'deno.dependencyProperties',
  FilePatterns = 'deno.files',
  OnSaveChangesTask = 'deno.onSaveChanges',
  PrereleaseTagFilter = 'deno.prereleaseTagFilter',
}

export type TJsrApiItem = {
  latest: string
  versions: {
    [version: string]: {
      yanked?: boolean
    }
  }
}

export interface IDenoServices {
  denoCachingOpts: CachingOptions
  denoHttpOpts: HttpOptions
  denoConfig: DenoConfig
  denoJsonClient: IJsonHttpClient
  jsrClient: JsrClient
  denoClient: DenoClient
}