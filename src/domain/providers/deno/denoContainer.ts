import type { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addDenoConfig,
  addDenoSuggestionResolver,
  addHttpOptions,
  addJsrClient,
  addSuggestionProvider
} from '#domain/providers/deno';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addDenoConfig(services);

  addJsrClient(services);

  addDenoSuggestionResolver(services);

  addSuggestionProvider(services);

  return await services.buildChild("deno", serviceProvider);
}