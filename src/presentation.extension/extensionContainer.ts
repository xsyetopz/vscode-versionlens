import { type IDomainServices, addDomainServices } from '#domain';
import type { IServiceCollection, IServiceProvider } from '#domain/di';
import { AwilixServiceCollectionFactory } from '#domain/di/awilix';
import { nameOf } from '#domain/utils';
import {
  VersionLensExtension,
  addEditorDependencyCache,
  addGetSuggestionsUseCase,
  addOnActiveTextEditorChange,
  addOnClearCache,
  addOnErrorClick,
  addOnFileLinkClick,
  addOnPackageDependenciesChanged,
  addOnPreSaveChanges,
  addOnProviderEditorActivated,
  addOnProviderTextDocumentChange,
  addOnProviderTextDocumentClose,
  addOnRemoveUrlAuthentication,
  addOnSaveChanges,
  addOnTextDocumentChange,
  addOnTextDocumentClose,
  addOnTextDocumentSave,
  addOnTogglePrereleases,
  addOnToggleReleases,
  addOnUpdateDependencyClick,
  addOutputChannel,
  addProviderNames,
  addSuggestionOptions,
  addVersionLensExtension,
  addVersionLensProviders,
  addVersionLensState
} from '#extension';
import { addInfrastructureServices } from '#infrastructure';
import { type ExtensionContext, type Memento, type SecretStorage, workspace } from 'vscode';
import {
  addAuthenticationInteractions,
  addAuthenticationProviderFactory,
  addAuthorization,
  addUrlAuthenticationSession,
  addUrlAuthenticationStore
} from './authorization/serviceFactory';

export async function configureContainer(context: ExtensionContext): Promise<IServiceProvider> {
  const serviceCollectionFactory = new AwilixServiceCollectionFactory();
  const services = serviceCollectionFactory.createServiceCollection();
  services.addSingleton(
    nameOf<IDomainServices>().serviceCollectionFactory,
    serviceCollectionFactory
  );

  // domain
  const defaultLogGroup = 'extension';
  addDomainServices(
    services,
    VersionLensExtension.extensionName,
    workspace.getConfiguration,
    defaultLogGroup
  );

  // infrastructure
  addInfrastructureServices(services);

  // extension
  addExtensionServices(services, context.workspaceState, context.secrets)

  return await services.build();
}

function addExtensionServices(
  services: IServiceCollection,
  workspaceState: Memento,
  secrets: SecretStorage
) {
  addProviderNames(services);
  addSuggestionOptions(services);
  addVersionLensState(services);
  addVersionLensExtension(services);
  addOutputChannel(services);
  addVersionLensProviders(services);
  addEditorDependencyCache(services);
  addGetSuggestionsUseCase(services);

  // auth
  addAuthorization(services);
  addAuthenticationInteractions(services);
  addAuthenticationProviderFactory(services, secrets);
  addUrlAuthenticationStore(services, workspaceState);
  addUrlAuthenticationSession(services);
  addOnRemoveUrlAuthentication(services, secrets);

  // command events
  addOnClearCache(services);
  addOnFileLinkClick(services);
  addOnUpdateDependencyClick(services);

  // editorTitleBar events
  addOnErrorClick(services);
  addOnToggleReleases(services);
  addOnTogglePrereleases(services);

  // install events
  addOnPreSaveChanges(services);
  addOnSaveChanges(services);

  // provider events
  addOnProviderEditorActivated(services);
  addOnProviderTextDocumentChange(services);
  addOnProviderTextDocumentClose(services);

  // vscode events
  addOnActiveTextEditorChange(services);
  addOnTextDocumentChange(services);
  addOnTextDocumentClose(services);
  addOnTextDocumentSave(services);

  // watcher events
  addOnPackageDependenciesChanged(services);
}