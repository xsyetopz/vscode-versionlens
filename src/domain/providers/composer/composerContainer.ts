import { CachingOptions } from '#domain/caching';
import { createJsonClient, HttpOptions } from '#domain/clients';
import { ServiceCollection } from '#domain';
import {
  ComposerConfig,
  ComposerFeatures,
  ComposerServiceName,
  ComposerSuggestionProvider,
  ComposerSuggestionResolver,
  IComposerService,
  PackagistClient
} from '#domain/providers/composer';
import { IDomainServices } from 'src/domain/definitions';

/**
 * Registers all Composer-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & IComposerService>) {

  services.addSingletonFactory(
    ComposerServiceName.composerCachingOpts,
    c => new CachingOptions(c.appConfig, ComposerFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    ComposerServiceName.composerHttpOpts,
    c => new HttpOptions(c.appConfig, ComposerFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    ComposerServiceName.composerConfig,
    c => new ComposerConfig(c.appConfig, c.composerCachingOpts, c.composerHttpOpts)
  );

  services.addSingletonFactory(
    ComposerServiceName.packagistClient,
    c => new PackagistClient(
      c.composerConfig,
      createJsonClient(c.authorizer, c.composerHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(PackagistClient)
    )
  );

  services.addSingletonFactory(
    ComposerServiceName.composerSuggestionResolver,
    c => new ComposerSuggestionResolver(
      c.composerConfig,
      c.packagistClient,
      c.loggerFactory(ComposerSuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "composer.suggestionProvider" as any,
    c => new ComposerSuggestionProvider(
      c.composerSuggestionResolver,
      c.composerConfig,
      c.loggerFactory(ComposerSuggestionProvider)
    )
  );

}
