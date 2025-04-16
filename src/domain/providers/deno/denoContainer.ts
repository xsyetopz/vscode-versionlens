import { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addDenoClient,
  addDenoConfig,
  addHttpOptions,
  addJsonClient,
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

  addJsonClient(services);

  addJsrClient(services);

  addDenoClient(services);

  addSuggestionProvider(services);

  return await services.buildChild("deno", serviceProvider);
}