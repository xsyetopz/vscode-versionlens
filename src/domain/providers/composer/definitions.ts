import { CachingOptions } from '#domain/caching';
import { HttpOptions, IJsonHttpClient } from '#domain/clients';
import { ComposerClient, ComposerConfig } from "#domain/providers/composer";

export enum ComposerFeatures {
  Caching = 'composer.caching',
  Http = 'composer.http',
  DependencyProperties = 'composer.dependencyProperties',
  ApiUrl = 'composer.apiUrl',
  FilePatterns = 'composer.files',
  OnSaveChangesTask = 'composer.onSaveChanges',
  PrereleaseTagFilter = 'composer.prereleaseTagFilter',
}

export interface IPackagistApiItem {
  version: string;
}

export interface IComposerService {
  composerCachingOpts: CachingOptions;
  composerHttpOpts: HttpOptions;
  composerConfig: ComposerConfig;
  composerJsonClient: IJsonHttpClient;
  composerClient: ComposerClient;
}