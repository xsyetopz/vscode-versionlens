import { CachingOptions } from '#domain/caching';
import { createJsonClient, GitHubJsonClient, HttpOptions } from '#domain/clients';
import { ServiceCollection } from '#domain';
import {
  INpmServices,
  NpmConfig,
  NpmFeatures,
  NpmGitHubClient,
  NpmRegistryClient,
  NpmServiceName,
  NpmSuggestionProvider,
  NpmSuggestionResolver
} from '#domain/providers/npm';
import NpmRegistryFetch from 'npm-registry-fetch';
import { IDomainServices } from 'src/domain/definitions';

/**
 * Registers all NPM-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & INpmServices>) {

  services.addSingletonFactory(
    NpmServiceName.npmCachingOpts,
    c => new CachingOptions(c.appConfig, NpmFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    NpmServiceName.npmHttpOpts,
    c => new HttpOptions(c.appConfig, NpmFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    NpmServiceName.npmConfig,
    c => new NpmConfig(c.appConfig, c.npmCachingOpts, c.npmHttpOpts)
  );

  services.addSingletonFactory(
    NpmServiceName.npmGithubClient,
    c => new NpmGitHubClient(
      c.npmConfig,
      new GitHubJsonClient(
        c.cachingOptions,
        createJsonClient(c.authorizer, c.npmHttpOpts),
        c.urlRequestCache
      ),
      c.loggerFactory(NpmGitHubClient)
    )
  );

  services.addSingletonFactory(
    NpmServiceName.npmRegistryClient,
    c => new NpmRegistryClient(
      NpmRegistryFetch,
      c.npmConfig,
      c.urlRequestCache,
      c.loggerFactory(NpmRegistryClient)
    )
  );

  services.addSingletonFactory(
    NpmServiceName.npmSuggestionResolver,
    c => new NpmSuggestionResolver(
      c.npmConfig,
      c.npmRegistryClient,
      c.npmGithubClient,
      c.loggerFactory(NpmSuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "npm.suggestionProvider" as any,
    c => new NpmSuggestionProvider(
      c.npmSuggestionResolver,
      c.npmConfig,
      c.loggerFactory(NpmSuggestionProvider)
    )
  );

}
