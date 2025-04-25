import type { CachingOptions } from '#domain/caching';
import type { HttpOptions, IShellClient, JsonClientResponse } from '#domain/clients';
import type { MavenClient, MavenConfig, MavenHttpClient, MvnCli } from '#domain/providers/maven';
import { type RegistryProtocols, nameOf } from '#domain/utils';

export enum MavenFeatures {
  Caching = 'maven.caching',
  Http = 'maven.http',
  DependencyProperties = 'maven.dependencyProperties',
  ApiUrl = 'maven.apiUrl',
  FilePatterns = 'maven.files',
  OnSaveChangesTask = 'maven.onSaveChanges',
  prereleaseTagFilter = 'maven.prereleaseTagFilter',
}

export interface IMavenServices {
  mavenCachingOpts: CachingOptions;
  mavenHttpOpts: HttpOptions;
  mavenConfig: MavenConfig;
  mvnShellClient: IShellClient;
  mvnCli: MvnCli;
  mavenHttpClient: MavenHttpClient;
  mavenClient: MavenClient;
}

export const MavenService = nameOf<IMavenServices>()

export type MavenRepository = {
  url: string,
  protocol: RegistryProtocols
}

export type MavenClientData = {
  repositories: Array<MavenRepository>
}

export type MavenApiResponse = JsonClientResponse<string[]>