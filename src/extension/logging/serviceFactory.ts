import type { IDomainServices } from '#domain';
import type { IServiceCollection } from '#domain/di';
import { nameOf } from '#domain/utils';
import { type IExtensionServices, VersionLensExtension } from '#extension';
import { OutputChannelTransport } from '#extension/logging';
import { window } from 'vscode';

export function addOutputChannel(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().outputChannel,
    // vscode output channel called "VersionLens"
    () => window.createOutputChannel(VersionLensExtension.extensionName, 'log'),
    true
  )
}

export function addWinstonChannelLogger(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().loggerChannel,
    (container: IDomainServices & IExtensionServices) =>
      new OutputChannelTransport(container.outputChannel, container.loggingOptions)
  );
}