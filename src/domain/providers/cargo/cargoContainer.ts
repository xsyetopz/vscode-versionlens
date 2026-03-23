import { IDomainServices, ServiceCollection } from '#domain';
import { CachingOptions } from '#domain/caching';
import { createJsonClient, HttpOptions } from '#domain/clients';
import { CargoConfig, CargoSuggestionProvider, CargoSuggestionResolver, CratesClient } from '.';
import { CargoFeatures, CargoServiceName, ICargoServices } from './definitions';

/**
 * Registers all Cargo-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & ICargoServices>) {

  services.addSingletonFactory(
    CargoServiceName.cargoCachingOpts,
    c => new CachingOptions(c.appConfig, CargoFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    CargoServiceName.cargoHttpOpts,
    c => new HttpOptions(c.appConfig, CargoFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    CargoServiceName.cargoConfig,
    c => new CargoConfig(c.appConfig, c.cargoCachingOpts, c.cargoHttpOpts)
  );

  services.addSingletonFactory(
    CargoServiceName.cratesClient,
    c => new CratesClient(
      c.cargoConfig,
      createJsonClient(c.authorizer, c.cargoHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(CratesClient)
    )
  );

  services.addSingletonFactory(
    CargoServiceName.cargoSuggestionResolver,
    c => new CargoSuggestionResolver(
      c.cargoConfig,
      c.cratesClient,
      c.loggerFactory(CargoSuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "cargo.suggestionProvider" as any,
    c => new CargoSuggestionProvider(
      c.cargoSuggestionResolver,
      c.cargoConfig,
      c.loggerFactory(CargoSuggestionProvider)
    )
  );

}
