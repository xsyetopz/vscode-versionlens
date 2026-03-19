import type { IDomainServices, ServiceProvider } from '#domain';
import { LogLevel } from '#domain/logging';
import { nameOf } from '#domain/utils';
import type { IExtensionServices } from '#extension';
import { dirname, join } from 'node:path';
import { type ExtensionContext, window } from 'vscode';
import { configureContainer } from './extensionContainer';

/**
 * The root service provider for the extension.
 */
let serviceProvider: ServiceProvider<IDomainServices & IExtensionServices>;

/**
 * Activates the VersionLens extension.
 * This is the entry point called by VS Code when the extension is loaded.
 * @param context The VS Code extension context.
 */
export async function activate(context: ExtensionContext): Promise<void> {
  // get the resource folder path (opened folder or single file)
  const resourceFolderPath = await getResourceFolderPath(context);

  // create the ioc service provider
  serviceProvider = configureContainer(context, resourceFolderPath);

  const serviceNames = nameOf<IDomainServices & IExtensionServices>();

  // get the logger
  const loggerFactory = serviceProvider.getService(serviceNames.loggerFactory);
  const logger = loggerFactory('activate');
  const logOutputChannel = serviceProvider.getService(serviceNames.logOutputChannel);

  // get the editorConfig
  const editorConfig = serviceProvider.getService(serviceNames.editorConfig);

  // check editor.codeLens is enabled
  if (editorConfig.codeLens === false) {
    logger.error(
      "Code lenses are disabled. This extension won't work unless you enable 'editor.codeLens' in your vscode settings"
    );
  }

  // get the extension info
  const extension = serviceProvider.getService(serviceNames.extension);
  const extensionPath = context.asAbsolutePath("");

  // log general start up info
  logger.info("extension path: {extensionPath}", extensionPath);
  logger.info("resource folder path: {resourceFolderPath}", join(resourceFolderPath, ".."));
  logger.info("workspace mode: {isWorkspaceMode}", extension.isWorkspaceMode);
  logger.info("version: {version}", context.extension.packageJSON.version);
  logger.info("log level: {logLevel}", LogLevel[logOutputChannel.logLevel]);
  logger.info("log folder: {logPath}", join(context.logUri.fsPath, ".."));

  await serviceProvider.getService(serviceNames.versionLensState).applyDefaults();

  // setup package dependency watcher
  const watcher = serviceProvider.getService(serviceNames.packageFileWatcher);

  if (extension.isWorkspaceMode)
    // watch workspace project files
    await watcher.watchFolder();
  else
    // watch single project file
    await watcher.watchFile(window.activeTextEditor!.document.uri)

  // instantiate dependencies that aren't referenced
  const instantiateDeps = [
    // auth events
    serviceNames.onAddUrlAuthentication,
    serviceNames.onRemoveUrlAuthentication,
    // commands events
    serviceNames.onClearCache,
    serviceNames.onFileLinkClick,
    serviceNames.onUpdateDependencyClick,
    serviceNames.onUpdateDependenciesLatest,
    serviceNames.onUpdateDependenciesMajor,
    serviceNames.onUpdateDependenciesMinor,
    serviceNames.onUpdateDependenciesPatch,
    serviceNames.onChooseBuildClick,
    serviceNames.onSortDependencies,
    // editorTitleBar events
    serviceNames.onCustomInstallClick,
    serviceNames.onErrorClick,
    serviceNames.onToggleReleases,
    serviceNames.onTogglePrereleases,
    // install events
    serviceNames.onSaveChanges, // will instantiate onTextDocumentSave
    // provider document events
    serviceNames.onProviderEditorActivated, // will instantiate onActiveTextEditorChange
    serviceNames.onProviderTextDocumentChange, // will instantiate onTextDocumentChange
    serviceNames.onProviderTextDocumentClose, // will instantiate onTextDocumentClose
    // watcher events
    serviceNames.onPackageDependenciesChanged
  ];

  for (const name of instantiateDeps) {
    serviceProvider.getService(name);
  }

  // ensure this is run when the extension is first loaded
  const onActiveTextEditorChange = serviceProvider.getService(serviceNames.onActiveTextEditorChange);
  onActiveTextEditorChange.execute(window.activeTextEditor)
}

/**
 * Deactivates the VersionLens extension.
 * Called by VS Code when the extension is being shut down.
 */
export async function deactivate() {
  if (serviceProvider) await serviceProvider.disposeAsync();
}

/**
 * Resolves the path to the resource folder for the current context.
 * Uses the workspace storage URI or the path of the active text editor.
 * @param context The extension context.
 * @returns A promise resolving to the resource folder path.
 */
async function getResourceFolderPath(context: ExtensionContext): Promise<string> {
  if (context.storageUri) return context.storageUri.path;
  const resourceFilePath = window.activeTextEditor!.document.uri.path;
  return dirname(resourceFilePath);
}
