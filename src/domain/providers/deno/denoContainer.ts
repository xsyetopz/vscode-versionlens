import { CachingOptions } from '#domain/caching';
import { createJsonClient, HttpOptions } from '#domain/clients';
import { ServiceCollection } from '#domain';
import {
  DenoConfig,
  DenoFeatures,
  DenoServiceName,
  DenoSuggestionProvider,
  DenoSuggestionResolver,
  IDenoServices,
  JsrClient
} from '#domain/providers/deno';
import { IDomainServices } from 'src/domain/definitions';
import { NpmServiceName } from '../npm';

/**
 * Registers all Deno-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & IDenoServices>) {

  services.addSingletonFactory(
    DenoServiceName.denoCachingOpts,
    c => new CachingOptions(c.appConfig, DenoFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    DenoServiceName.denoHttpOpts,
    c => new HttpOptions(c.appConfig, DenoFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    DenoServiceName.denoConfig,
    c => new DenoConfig(c.appConfig, c.denoCachingOpts, c.denoHttpOpts)
  );

  services.addSingletonFactory(
    DenoServiceName.jsrClient,
    c => new JsrClient(
      c.denoConfig,
      createJsonClient(c.authorizer, c.denoHttpOpts),
      c.urlRequestCache,
      c.loggerFactory(JsrClient)
    )
  );

  services.addSingletonFactory(
    DenoServiceName.denoClient,
    c => new DenoSuggestionResolver(
      c.denoConfig,
      c.jsrClient,
      (c as any)[NpmServiceName.npmSuggestionResolver],
      c.loggerFactory(DenoSuggestionResolver)
    )
  );

  services.addSingletonFactory(
    "deno.suggestionProvider" as any,
    c => new DenoSuggestionProvider(
      c.denoClient,
      c.denoConfig,
      (c as any)['npm.suggestionProvider'],
      c.loggerFactory(DenoSuggestionProvider)
    )
  );

}
