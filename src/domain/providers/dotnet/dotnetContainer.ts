import { IDomainServices, ServiceCollection } from '#domain';
import { CachingOptions } from '#domain/caching';
import { createJsonClient, createShellClient, HttpOptions } from '#domain/clients';
import {
  DotNetCli,
  DotNetConfig,
  DotNetFeatures,
  DotNetServiceName,
  DotNetSuggestionProvider,
  DotnetSuggestionResolver,
  IDotNetServices,
  NuGetClient,
  NugetOptions
} from '#domain/providers/dotnet';

/**
 * Registers all DotNet-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & IDotNetServices>) {

  services.addSingletonFactory(
    DotNetServiceName.dotnetCachingOpts,
    c => new CachingOptions(c.appConfig, DotNetFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    DotNetServiceName.dotnetHttpOpts,
    c => new HttpOptions(c.appConfig, DotNetFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    DotNetServiceName.nugetOpts,
    c => new NugetOptions(c.appConfig, DotNetFeatures.Nuget)
  );

  services.addSingletonFactory(
    DotNetServiceName.dotnetConfig,
    c => new DotNetConfig(
      c.appConfig,
      c.dotnetCachingOpts,
      c.dotnetHttpOpts,
      c.nugetOpts
    )
  );

  services.addSingletonFactory(
    DotNetServiceName.dotnetCli,
    c => new DotNetCli(
      c.dotnetConfig,
      createShellClient(
        c.shellCache,
        c.dotnetCachingOpts,
        c.loggerFactory(DotNetCli)
      ),
      c.loggerFactory(DotNetCli)
    )
  );

  services.addSingletonFactory(
    DotNetServiceName.nugetClient,
    c => new NuGetClient(
      c.dotnetConfig,
      createJsonClient(c.authorizer, c.dotnetHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(NuGetClient)
    )
  );

  services.addSingletonFactory(
    DotNetServiceName.dotnetSuggestionResolver,
    c => new DotnetSuggestionResolver(
      c.dotnetConfig,
      c.nugetClient,
      c.loggerFactory(DotnetSuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "dotnet.suggestionProvider" as any,
    c => new DotNetSuggestionProvider(
      c.dotnetSuggestionResolver,
      c.dotnetCli,
      c.nugetClient,
      c.dotnetConfig,
      c.loggerFactory(DotNetSuggestionProvider)
    )
  );

}
