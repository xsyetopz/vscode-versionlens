import { DomainServiceName, IDomainServices, ServiceCollection } from '#domain';
import { ExtensionServiceName, IExtensionServices } from '#extension';
import {
  AuthenticationInteractions,
  AuthenticationScheme,
  Authorizer,
  BasicAuthProvider,
  CustomAuthProvider,
  UrlAuthenticationStore
} from '#extension/authorization';
import { type Memento, type SecretStorage, window } from 'vscode';

/**
 * Registers the authentication providers as a singleton in the service collection.
 * @param services The service collection to add to.
 * @param resourceFolderPath The path to the resources folder.
 * @param secrets The VS Code secret storage.
 */
export function addAuthenticationServices(
  services: ServiceCollection<IDomainServices & IExtensionServices>,
  resourceFolderPath: string,
  secrets: SecretStorage,
  workspaceState: Memento
) {
  const serviceName = ExtensionServiceName.authenticationProviders;
  services.addSingletonFactory(
    serviceName,
    container => ({
      [AuthenticationScheme.Basic]: new BasicAuthProvider(
        resourceFolderPath,
        secrets,
        container.authenticationInteractions
      ),
      [AuthenticationScheme.Custom]: new CustomAuthProvider(
        resourceFolderPath,
        secrets,
        container.authenticationInteractions
      )
    })
  );

  services.addSingletonFactory(
    ExtensionServiceName.authenticationInteractions,
    () => new AuthenticationInteractions(window)
  );

  services.addSingletonFactory(
    ExtensionServiceName.urlAuthenticationStore,
    () => new UrlAuthenticationStore('UrlAuthenticationStore', workspaceState)
  );

  services.addSingletonFactory(
    DomainServiceName.authorizer,
    container =>
      new Authorizer(
        container.urlAuthenticationStore,
        container.authenticationProviders,
        container.authenticationInteractions,
        container.loggerFactory(Authorizer)
      )
  );
}
