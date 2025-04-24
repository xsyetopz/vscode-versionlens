import type { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addCargoClient,
  addCargoConfig,
  addCratesClient,
  addHttpOptions,
  addJsonClient,
  addSuggestionProvider
} from '#domain/providers/cargo';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addCargoConfig(services);

  addJsonClient(services);

  addCratesClient(services);

  addCargoClient(services);

  addSuggestionProvider(services);

  return await services.buildChild("cargo", serviceProvider);
}