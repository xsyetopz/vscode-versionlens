import type { IDomainServices } from '#domain';
import { CachingOptions } from '#domain/caching';
import { createHttpClient, HttpOptions } from '#domain/clients';
import type { IServiceCollection } from '#domain/di';
import type { IProviderServices } from '#domain/providers';
import {
  type IPypiServices,
  PypiConfig,
  PypiFeatures,
  PypiHttpClient,
  PypiService,
  PypiSuggestionProvider,
  PypiSuggestionResolver
} from '#domain/providers/pypi';
import { nameOf } from '#domain/utils';

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    PypiService.pypiCachingOpts,
    (container: IDomainServices) =>
      new CachingOptions(
        container.appConfig,
        PypiFeatures.Caching,
        'caching'
      )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    PypiService.pypiHttpOpts,
    (container: IDomainServices) =>
      new HttpOptions(
        container.appConfig,
        PypiFeatures.Http,
        'http'
      )
  );
}

export function addPypiConfig(services: IServiceCollection) {
  services.addSingleton(
    PypiService.pypiConfig,
    (container: IPypiServices & IDomainServices) =>
      new PypiConfig(
        container.appConfig,
        container.pypiCachingOpts,
        container.pypiHttpOpts
      )
  );
}

export function addPypiHttpClient(services: IServiceCollection) {
  const serviceName = PypiService.pypiHttpClient;
  services.addSingleton(
    serviceName,
    (container: IPypiServices & IDomainServices) =>
      new PypiHttpClient(
        container.pypiConfig,
        createHttpClient(
          container.authorizer,
          {
            caching: container.pypiCachingOpts,
            http: container.pypiHttpOpts
          }
        ),
        container.urlRequestCache,
        container.loggerFactory.create(serviceName)
      )
  );
}

export function addPypiSuggestionResolver(services: IServiceCollection) {
  const serviceName = PypiService.pypiSuggestionResolver;
  services.addSingleton(
    serviceName,
    (container: IPypiServices & IDomainServices) =>
      new PypiSuggestionResolver(
        container.pypiConfig,
        container.pypiHttpClient,
        container.loggerFactory.create(serviceName)
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addScoped(
    nameOf<IProviderServices>().suggestionProvider,
    (container: IPypiServices & IDomainServices) =>
      new PypiSuggestionProvider(
        container.pypiSuggestionResolver,
        container.pypiConfig,
        container.loggerFactory.create(PypiSuggestionProvider.name)
      )
  );
}