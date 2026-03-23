import { CachingOptions } from '#domain/caching';
import { createHttpClient, createShellClient, HttpOptions } from '#domain/clients';
import { IDomainServices, ServiceCollection } from '#domain';
import {
  IMavenServices,
  MavenConfig,
  MavenFeatures,
  MavenHttpClient,
  MavenServiceName,
  MavenSuggestionProvider,
  MavenSuggestionResolver,
  MvnCli
} from '#domain/providers/maven';

/**
 * Registers all Maven-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & IMavenServices>) {

  services.addSingletonFactory(
    MavenServiceName.mavenCachingOpts,
    c => new CachingOptions(c.appConfig, MavenFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    MavenServiceName.mavenHttpOpts,
    c => new HttpOptions(c.appConfig, MavenFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    MavenServiceName.mavenConfig,
    c => new MavenConfig(c.appConfig, c.mavenCachingOpts, c.mavenHttpOpts)
  );

  services.addSingletonFactory(
    MavenServiceName.mvnCli,
    c => new MvnCli(
      c.mavenConfig,
      createShellClient(
        c.shellCache,
        c.mavenCachingOpts,
        c.loggerFactory(MvnCli)
      ),
      c.loggerFactory(MvnCli)
    )
  );

  services.addSingletonFactory(
    MavenServiceName.mavenHttpClient,
    c => new MavenHttpClient(
      c.mavenConfig,
      createHttpClient(c.authorizer, c.mavenHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(MavenHttpClient)
    )
  );

  services.addSingletonFactory(
    MavenServiceName.mavenSuggestionResolver,
    c => new MavenSuggestionResolver(
      c.mavenConfig,
      c.mavenHttpClient,
      c.loggerFactory(MavenSuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "maven.suggestionProvider" as any,
    c => new MavenSuggestionProvider(
      c.mavenSuggestionResolver,
      c.mvnCli,
      c.mavenConfig,
      c.loggerFactory(MavenSuggestionProvider)
    )
  );

}
