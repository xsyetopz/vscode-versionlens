import { CachingOptions } from '#domain/caching';
import { createHttpClient, HttpOptions } from '#domain/clients';
import { ServiceCollection } from '#domain';
import {
  IPypiServices,
  PypiConfig,
  PypiFeatures,
  PypiHttpClient,
  PypiService,
  PypiSuggestionProvider,
  PypiSuggestionResolver
} from '#domain/providers/pypi';
import { IDomainServices } from 'src/domain/definitions';

/**
 * Registers all PyPi-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & IPypiServices>) {

  services.addSingletonFactory(
    PypiService.pypiCachingOpts,
    c => new CachingOptions(c.appConfig, PypiFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    PypiService.pypiHttpOpts,
    c => new HttpOptions(c.appConfig, PypiFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    PypiService.pypiConfig,
    c => new PypiConfig(c.appConfig, c.pypiCachingOpts, c.pypiHttpOpts)
  );

  services.addSingletonFactory(
    PypiService.pypiHttpClient,
    c => new PypiHttpClient(
      c.pypiConfig,
      createHttpClient(c.authorizer, c.pypiHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(PypiHttpClient)
    )
  );

  services.addSingletonFactory(
    PypiService.pypiSuggestionResolver,
    c => new PypiSuggestionResolver(
      c.pypiConfig,
      c.pypiHttpClient,
      c.loggerFactory(PypiSuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "pypi.suggestionProvider" as any,
    c => new PypiSuggestionProvider(
      c.pypiSuggestionResolver,
      c.pypiConfig,
      c.loggerFactory(PypiSuggestionProvider)
    )
  );

}
