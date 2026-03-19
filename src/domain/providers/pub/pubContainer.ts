import { CachingOptions } from '#domain/caching';
import { createJsonClient, HttpOptions } from '#domain/clients';
import { ServiceCollection } from '#domain';
import {
  IPubServices,
  PubConfig,
  PubFeatures,
  PubJsonClient,
  PubServiceName,
  PubSuggestionProvider,
  PubSuggestionResolver
} from '#domain/providers/pub';
import { IDomainServices } from 'src/domain/definitions';

/**
 * Registers all Pub-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & IPubServices>) {

  services.addSingletonFactory(
    PubServiceName.pubCachingOpts,
    c => new CachingOptions(c.appConfig, PubFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    PubServiceName.pubHttpOpts,
    c => new HttpOptions(c.appConfig, PubFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    PubServiceName.pubConfig,
    c => new PubConfig(c.appConfig, c.pubCachingOpts, c.pubHttpOpts)
  );

  services.addSingletonFactory(
    PubServiceName.pubJsonClient,
    c => new PubJsonClient(
      c.pubConfig,
      createJsonClient(c.authorizer, c.pubHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(PubJsonClient)
    )
  );

  services.addSingletonFactory(
    PubServiceName.pubSuggestionResolver,
    c => new PubSuggestionResolver(
      c.pubConfig,
      c.pubJsonClient,
      c.loggerFactory(PubSuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "pub.suggestionProvider" as any,
    c => new PubSuggestionProvider(
      c.pubSuggestionResolver,
      c.pubConfig,
      c.loggerFactory(PubSuggestionProvider)
    )
  );

}
