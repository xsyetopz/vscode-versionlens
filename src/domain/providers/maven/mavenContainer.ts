import { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addHttpOptions,
  addMavenClient,
  addMavenConfig,
  addMavenHttpClient,
  addMvnCliClient,
  addSuggestionProvider
} from '#domain/providers/maven';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addMavenConfig(services);

  addMvnCliClient(services);

  addMavenHttpClient(services);

  addMavenClient(services);

  addSuggestionProvider(services);

  return await services.buildChild("maven", serviceProvider);
}