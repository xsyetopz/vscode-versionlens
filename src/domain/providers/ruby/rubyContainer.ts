import { IDomainServices, ServiceCollection } from '#domain';
import { CachingOptions } from '#domain/caching';
import { createJsonClient, GitHubJsonClient, HttpOptions } from '#domain/clients';
import {
  IRubyServices,
  RubyConfig,
  RubyFeatures,
  RubyGitHubClient,
  RubyHttpClient,
  RubyServiceName,
  RubySuggestionProvider,
  RubySuggestionResolver
} from '#domain/providers/ruby';

/**
 * Registers all Ruby-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & IRubyServices>) {

  services.addSingletonFactory(
    RubyServiceName.rubyCachingOpts,
    c => new CachingOptions(c.appConfig, RubyFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    RubyServiceName.rubyHttpOpts,
    c => new HttpOptions(c.appConfig, RubyFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    RubyServiceName.rubyConfig,
    c => new RubyConfig(c.appConfig, c.rubyCachingOpts, c.rubyHttpOpts)
  );

  services.addSingletonFactory(
    RubyServiceName.rubyHttpClient,
    c => new RubyHttpClient(
      c.rubyConfig,
      createJsonClient(c.authorizer, c.rubyHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(RubyHttpClient)
    )
  );

  services.addSingletonFactory(
    RubyServiceName.rubyGithubClient,
    c => new RubyGitHubClient(
      new GitHubJsonClient(
        c.cachingOptions,
        createJsonClient(c.authorizer, c.rubyHttpOpts),
        c.urlRequestCache
      )
    )
  );

  services.addSingletonFactory(
    RubyServiceName.rubySuggestionResolver,
    c => new RubySuggestionResolver(
      c.rubyConfig,
      c.rubyHttpClient,
      c.rubyGithubClient,
      c.loggerFactory(RubySuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "ruby.suggestionProvider" as any,
    c => new RubySuggestionProvider(
      c.rubySuggestionResolver,
      c.rubyConfig,
      c.loggerFactory(RubySuggestionProvider)
    )
  );

}
