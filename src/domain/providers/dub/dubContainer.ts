import { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addDubClient,
  addDubConfig,
  addDubJsonClient,
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

  addDubClient(services);

  addSuggestionProvider(services);

  return await services.buildChild("dub", serviceProvider);
}