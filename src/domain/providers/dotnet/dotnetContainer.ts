import type { IServiceCollection, IServiceProvider } from '#domain/di';
import {
  addCachingOptions,
  addCliClient,
  addDotNetConfig,
  addDotnetSuggestionResolver,
  addHttpOptions,
  addNuGetClient,
  addNugetOptions,
  addSuggestionProvider
} from '#domain/providers/dotnet';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addNugetOptions(services);

  addHttpOptions(services);

  addDotNetConfig(services);

  addCliClient(services);

  addDotnetSuggestionResolver(services);

  addNuGetClient(services);

  addSuggestionProvider(services);

  return await services.buildChild("dotnet", serviceProvider);
}