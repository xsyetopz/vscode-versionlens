import type { IDomainServices } from '#domain';
import type { IServiceCollection } from '#domain/di';
import { nameOf } from '#domain/utils';
import type { IExtensionServices } from '#extension';
import {
  AuthenticationInteractions,
  Authorization,
  UrlAuthenticationStore
} from '#extension/authorization';
import { IVsCodeAuthentication } from '#extension/vscode';
import { type Memento, type SecretStorage, authentication, window } from 'vscode';
import { AuthenticationProviderFactory } from './authenticationProviderFactory';

export function addAuthenticationInteractions(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().authenticationInteractions;
  services.addSingleton(
    serviceName,
    (container: IDomainServices) => new AuthenticationInteractions(
      window,
      container.logger.child({ logGroup: serviceName })
    )
  );
}

export function addAuthenticationProviderFactory(
  services: IServiceCollection,
  secrets: SecretStorage
) {
  services.addSingleton(
    nameOf<IExtensionServices>().authenticationProviderFactory,
    (container: IExtensionServices) =>
      new AuthenticationProviderFactory(
        authentication,
        container.authenticationInteractions,
        secrets
      ),
    true
  );
}

export function addUrlAuthenticationStore(services: IServiceCollection, persistence: Memento) {
  const serviceName = nameOf<IExtensionServices>().urlAuthenticationStore;
  services.addSingleton(
    serviceName,
    () => new UrlAuthenticationStore(UrlAuthenticationStore.name, persistence)
  );
}

export function addAuthorization(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().authorization;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) =>
      new Authorization(
        container.authenticationInteractions,
        container.urlAuthenticationStore,
        container.authenticationProviderFactory,
        authentication as IVsCodeAuthentication,
        container.logger.child({ logGroup: serviceName })
      )
  );
}