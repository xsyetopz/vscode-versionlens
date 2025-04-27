import type { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addGoSuggestionResolver,
  addGoConfig,
  addGoHttpClient,
  addHttpOptions,
  addSuggestionProvider
} from '#domain/providers/golang';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addGoConfig(services);

  addGoHttpClient(services);

  addGoSuggestionResolver(services);

  addSuggestionProvider(services);

  return await services.buildChild("golang", serviceProvider);
}