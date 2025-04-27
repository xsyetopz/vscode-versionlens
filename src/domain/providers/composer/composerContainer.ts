import type { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addComposerConfig,
  addComposerSuggestionResolver,
  addHttpOptions,
  addPackagistClient,
  addSuggestionProvider
} from '#domain/providers/composer';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addComposerConfig(services);

  addPackagistClient(services);

  addComposerSuggestionResolver(services);

  addSuggestionProvider(services);

  return await services.buildChild("composer", serviceProvider);
}