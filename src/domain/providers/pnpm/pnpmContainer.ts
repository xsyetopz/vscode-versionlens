import { CachingOptions } from '#domain/caching';
import { HttpOptions } from '#domain/clients';
import { ServiceCollection } from '#domain';
import { IDomainServices } from 'src/domain/definitions';
import { IPnpmServices, PnpmConfig, PnpmFeatures, PnpmServiceName, PnpmSuggestionProvider } from '.';

/**
 * Registers all PNPM-specific services into the provided service collection.
 * @param services The service collection to configure.
 */
export function registerServices(services: ServiceCollection<IDomainServices & IPnpmServices>) {

  services.addSingletonFactory(
    PnpmServiceName.pnpmCachingOpts,
    c => new CachingOptions(c.appConfig, PnpmFeatures.Caching, 'caching')
  );

  services.addSingletonFactory(
    PnpmServiceName.pnpmHttpOpts,
    c => new HttpOptions(c.appConfig, PnpmFeatures.Http, 'http')
  );

  services.addSingletonFactory(
    PnpmServiceName.pnpmConfig,
    c => new PnpmConfig(c.appConfig, c.pnpmCachingOpts, c.pnpmHttpOpts)
  );

  services.addSingletonFactory(
    "pnpm.suggestionProvider" as any,
    c => {
      return new PnpmSuggestionProvider(
        c.pnpmConfig,
        (c as any)['npm.suggestionProvider'],
        c.loggerFactory(PnpmSuggestionProvider)
      );
    }
  );

}
