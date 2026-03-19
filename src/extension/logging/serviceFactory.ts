import { DomainServiceName, IDomainServices, ServiceCollection } from '#domain';
import { ConsoleLoggerSink, createLoggerFactory, LogLevel } from '#domain/logging';
import { ExtensionServiceName, IExtensionServices, VersionLensExtension } from '#extension';
import { OutputChannelLoggerSink } from '#extension/logging';
import { window } from 'vscode';

/**
 * Registers the VS Code log output channel as a singleton.
 * @param services The service collection to add to.
 */
export function addLoggingServices(services: ServiceCollection<IExtensionServices & IDomainServices>) {

  services.addSingletonFactory(
    DomainServiceName.loggerFactory,
    c => createLoggerFactory(c.loggerSinks)
  )

  services.addSingletonFactory(
    ExtensionServiceName.logOutputChannel,
    () => window.createOutputChannel(VersionLensExtension.extensionName, { log: true })
  )

  services.addSingletonFactory(
    ConsoleLoggerSink,
    () => new ConsoleLoggerSink(LogLevel.error)
  );

  services.addSingletonFactory(
    OutputChannelLoggerSink,
    c => new OutputChannelLoggerSink(c.logOutputChannel)
  );

  services.addSingletonGroup(
    DomainServiceName.loggerSinks,
    ConsoleLoggerSink,
    OutputChannelLoggerSink
  );

}