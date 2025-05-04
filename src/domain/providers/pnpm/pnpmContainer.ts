import type { IServiceCollection, IServiceProvider } from '#domain/di';
import { addPnpmConfig, addSuggestionProvider } from './serviceFactory.js';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addPnpmConfig(services);

  addSuggestionProvider(services);

  return await services.buildChild('pnpm', serviceProvider);
}