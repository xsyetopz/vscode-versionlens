import { CachingOptions } from '#domain/caching';
import { HttpOptions, IHttpClient } from '#domain/clients';
import { PypiClient, PypiConfig } from '#domain/providers/pypi';

export enum PypiFeatures {
  Caching = 'pypi.caching',
  Http = 'pypi.http',
  DependencyProperties = 'pypi.dependencyProperties',
  ApiUrl = 'pypi.apiUrl',
  FilePatterns = 'pypi.files',
  OnSaveChangesTask = 'pypi.onSaveChanges',
  PrereleaseTagFilter = 'pypi.prereleaseTagFilter',
}

export interface IPypiService {
  pypiCachingOpts: CachingOptions;
  pypiHttpOpts: HttpOptions;
  pypiConfig: PypiConfig;
  pypiHttpClient: IHttpClient;
  pypiClient: PypiClient;
}