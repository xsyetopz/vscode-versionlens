import type { IDomainServices } from '#domain';
import type { IServiceCollection } from '#domain/di';
import { nameOf } from '#domain/utils';
import { type IExtensionServices, AuthorizationCommandFeatures } from '#extension';
import { OnRemoveUrlAuthentication } from '#extension/events';
import { commands, SecretStorage } from 'vscode';

export function addOnRemoveUrlAuthentication(
  services: IServiceCollection,
  secrets: SecretStorage
) {
  const serviceName = nameOf<IExtensionServices>().onRemoveUrlAuthentication;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      // create the event handler
      const handler = new OnRemoveUrlAuthentication(
        container.urlAuthenticationStore,
        container.authenticationSession,
        secrets,
        container.packageCache,
        container.authenticationInteractions,
        container.logger.child({ logGroup: serviceName })
      );

      // register the vscode command
      handler.disposable = commands.registerCommand(
        AuthorizationCommandFeatures.OnRemoveUrlAuthentication,
        handler.execute,
        handler
      );

      return handler;
    },
    true
  )
}