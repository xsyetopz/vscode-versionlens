import type { ServiceProvider } from '#domain';
import type { IAuthorizer } from '#domain/authorization';
import type { CachingOptions, IExpiryCache } from '#domain/caching';
import type { HttpOptions, OsvClient } from '#domain/clients';
import type { Config } from '#domain/configuration';
import type { ILoggerSink, LoggerFactory } from '#domain/logging';
import type { DependencyCache, PackageCache } from '#domain/packages';
import type { ISuggestionProvider } from '#domain/providers';
import type { IStorage } from '#domain/storage';
import type {
  FetchPackage,
  FetchPackages,
  GetDependencyChanges,
  GetSuggestionProvider,
  GetSuggestions,
  GetVulnerabilities,
  SortDependencies
} from '#domain/useCases';
import { nameOf } from '#domain/utils';
export { ServiceCollection, ServiceProvider, type TypeMap } from '@js-injection/service-provider';

/**
 * Defines the core services available in the domain layer.
 */
export interface IDomainServices {
  /** The root service provider for the domain. */
  serviceProvider: ServiceProvider<IDomainServices>
  /** The authorizer for handling credentials. */
  authorizer: IAuthorizer
  /** The application configuration. */
  appConfig: Config
  /** The collection of logger sinks. */
  loggerSinks: ILoggerSink[]
  /** The factory for creating logger instances. */
  loggerFactory: LoggerFactory
  /** Global HTTP client options. */
  httpOptions: HttpOptions
  /** Global caching options. */
  cachingOptions: CachingOptions
  /** The storage provider for file access. */
  storage: IStorage
  /** List of available package provider names. */
  providerNames: Array<string>
  /** List of initialized suggestion providers. */
  suggestionProviders: Array<ISuggestionProvider>
  /** Cache for dependencies parsed from files. */
  fileWatcherDependencyCache: DependencyCache
  /** Cache for package suggestion responses. */
  packageCache: PackageCache
  /** Cache for shell command results. */
  shellCache: IExpiryCache
  /** Cache for URL-based requests. */
  urlRequestCache: IExpiryCache
  /** Cache for OSV-based requests. */
  osvRequestCache: IExpiryCache
  /** Client for OSV API. */
  osvClient: OsvClient
  /** Use case for matching files to providers. */
  GetSuggestionProvider: GetSuggestionProvider
  /** Use case for batch fetching package data. */
  fetchPackages: FetchPackages
  /** Use case for fetching a single package. */
  fetchPackage: FetchPackage
  /** Use case for retrieving suggestions for a file. */
  getSuggestions: GetSuggestions
  /** Use case for detecting dependency changes in a file. */
  getDependencyChanges: GetDependencyChanges
  /** Use case for getting vulnerabilities for a package. */
  getVulnerabilities: GetVulnerabilities
  /** Use case for sorting dependencies alphabetically. */
  sortDependencies: SortDependencies
}

/**
 * Service name constant for domain services.
 */
export const DomainServiceName = nameOf<IDomainServices>()
