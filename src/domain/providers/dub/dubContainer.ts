import { CachingOptions } from '#domain/caching';
import { createJsonClient, HttpOptions } from '#domain/clients';
import { ServiceCollection } from '#domain';
import {
  DubConfig,
  DubFeatures,
  DubJsonClient,
  DubServiceName,
  DubSuggestionProvider,
  DubSuggestionResolver,
  IDubServices
} from '#domain/providers/dub';
import { IDomainServices } from 'src/domain/definitions';

/**
 * Registers all Dub-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & IDubServices>) {

  services.addSingletonFactory(
    DubServiceName.dubCachingOpts,
    c => new CachingOptions(c.appConfig, DubFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    DubServiceName.dubHttpOpts,
    c => new HttpOptions(c.appConfig, DubFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    DubServiceName.dubConfig,
    c => new DubConfig(c.appConfig, c.dubCachingOpts, c.dubHttpOpts)
  );

  services.addSingletonFactory(
    DubServiceName.dubJsonClient,
    c => new DubJsonClient(
      c.dubConfig,
      createJsonClient(c.authorizer, c.dubHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(DubJsonClient)
    )
  );

  services.addSingletonFactory(
    DubServiceName.dubSuggestionResolver,
    c => new DubSuggestionResolver(
      c.dubConfig,
      c.dubJsonClient,
      c.loggerFactory(DubSuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "dub.suggestionProvider" as any,
    c => new DubSuggestionProvider(
      c.dubSuggestionResolver,
      c.dubConfig,
      c.loggerFactory(DubSuggestionProvider)
    )
  );

}
