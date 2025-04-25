import { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addCliClient,
  addHttpOptions,
  addMavenClient,
  addMavenConfig,
  addMavenHttpClient,
  addProcessClient,
  addSuggestionProvider
} from '#domain/providers/maven';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addMavenConfig(services);

  addProcessClient(services);

  addCliClient(services);

  addMavenHttpClient(services);

  addMavenClient(services);

  addSuggestionProvider(services);

  return await services.buildChild("maven", serviceProvider);
}