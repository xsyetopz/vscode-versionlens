import { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addDubConfig,
  addDubJsonClient,
  addDubSuggestionResolver,
  addHttpOptions,
  addSuggestionProvider
} from '#domain/providers/dub';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addDubConfig(services);

  addDubJsonClient(services);

  addDubSuggestionResolver(services);

  addSuggestionProvider(services);

  return await services.buildChild("dub", serviceProvider);
}