import type { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addHttpOptions,
  addPypiConfig,
  addPypiHttpClient,
  addPypiSuggestionResolver,
  addSuggestionProvider
} from '#domain/providers/pypi';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addPypiConfig(services);

  addPypiHttpClient(services);

  addPypiSuggestionResolver(services);

  addSuggestionProvider(services);

  return await services.buildChild("pypi", serviceProvider);
}