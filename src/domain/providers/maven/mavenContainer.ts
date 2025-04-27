import { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addHttpOptions,
  addMavenSuggestionResolver,
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

  addMavenSuggestionResolver(services);

  addSuggestionProvider(services);

  return await services.buildChild("maven", serviceProvider);
}