import { IDomainServices, ServiceCollection } from '#domain';
import { CachingOptions } from '#domain/caching';
import { createHttpClient, HttpOptions } from '#domain/clients';
import {
  GoConfig,
  GoFeatures,
  GoHttpClient,
  GoServiceName,
  GoSuggestionProvider,
  GoSuggestionResolver,
  IGoServices
} from '#domain/providers/golang';

/**
 * Registers all Go-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & IGoServices>) {

  services.addSingletonFactory(
    GoServiceName.goCachingOpts,
    c => new CachingOptions(c.appConfig, GoFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    GoServiceName.goHttpOpts,
    c => new HttpOptions(c.appConfig, GoFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    GoServiceName.goConfig,
    c => new GoConfig(c.appConfig, c.goCachingOpts, c.goHttpOpts)
  );

  services.addSingletonFactory(
    GoServiceName.goHttpClient,
    c => new GoHttpClient(
      c.goConfig,
      createHttpClient(c.authorizer, c.goHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(GoHttpClient)
    )
  );

  services.addSingletonFactory(
    GoServiceName.goSuggestionResolver,
    c => new GoSuggestionResolver(
      c.goConfig,
      c.goHttpClient,
      c.loggerFactory(GoSuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "golang.suggestionProvider" as any,
    c => new GoSuggestionProvider(
      c.goSuggestionResolver,
      c.goConfig,
      c.loggerFactory(GoSuggestionProvider)
    )
  );

}
