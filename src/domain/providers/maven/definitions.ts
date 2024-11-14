import { CachingOptions } from '#domain/caching';
import { HttpOptions, IHttpClient, IShellClient } from '#domain/clients';
import { MavenClient, MavenConfig, MvnCli } from '#domain/providers/maven';
import { RegistryProtocols } from '#domain/utils';

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
  mavenHttpClient: IHttpClient;
  mavenClient: MavenClient;
}

export type MavenRepository = {
  url: string,
  protocol: RegistryProtocols
}

export type MavenClientData = {
  repositories: Array<MavenRepository>
}