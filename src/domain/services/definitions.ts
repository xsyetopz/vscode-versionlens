import { type IExpiryCache, CachingOptions } from '#domain/caching';
import { HttpOptions } from '#domain/clients';
import { Config } from '#domain/configuration';
import type { IServiceCollectionFactory, IServiceProvider } from '#domain/di';
import { type ILogger, type ILoggerChannel, LoggingOptions } from '#domain/logging';
import { type IPackageFileWatcher, DependencyCache, PackageCache } from '#domain/packages';
import type { ISuggestionProvider } from '#domain/providers';
import type { IStorage } from '#domain/storage';
import {
  FetchPackage,
  FetchPackages,
  GetDependencyChanges,
  GetSuggestionProvider,
  GetSuggestions
} from '#domain/useCases';

export interface IDomainServices {

  serviceCollectionFactory: IServiceCollectionFactory;

  serviceProvider: IServiceProvider;

  appConfig: Config;

  loggingOptions: LoggingOptions;

  httpOptions: HttpOptions;

  cachingOptions: CachingOptions;

  logger: ILogger;

  loggerChannel: ILoggerChannel;

  storage: IStorage,

  providerNames: Array<string>;

  suggestionProviders: Array<ISuggestionProvider>;

  packageFileWatcher: IPackageFileWatcher;

  fileWatcherDependencyCache: DependencyCache;

  packageCache: PackageCache;

  shellCache: IExpiryCache;

  GetSuggestionProvider: GetSuggestionProvider;

  fetchPackages: FetchPackages;

  fetchPackage: FetchPackage;

  getSuggestions: GetSuggestions;

  getDependencyChanges: GetDependencyChanges;

}