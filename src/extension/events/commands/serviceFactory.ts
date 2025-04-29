import type { IDomainServices } from '#domain';
import type { IServiceCollection } from '#domain/di';
import {
  type IExtensionServices,
  ExtensionServiceName,
  SuggestionCommandFeatures
} from '#extension';
import {
  OnChooseBuildClick,
  OnClearCache,
  OnFileLinkClick,
  OnRefreshSuggestionsStats,
  OnUpdateDependencyClick
} from '#extension/events';
import { SuggestionInteractions } from '#extension/suggestions';
import { commands, env, StatusBarAlignment, window, workspace } from 'vscode';
import { VsCodeConstructionFactory } from '../../vscode/vsCodeConstructFactory';

export function addOnClearCache(services: IServiceCollection) {
  const serviceName = ExtensionServiceName.onClearCache;
  services.addSingleton(
    serviceName,
    (container: IDomainServices) => {
      // create the event handler
      const handler = new OnClearCache(
        container.packageCache,
        container.shellCache,
        container.urlRequestCache,
        container.loggerFactory.create(serviceName)
      );

      // register the vscode command
      handler.disposable = commands.registerCommand(
        SuggestionCommandFeatures.OnClearCache,
        handler.execute,
        handler
      );

      return handler;
    },
    true
  )
}

export function addOnFileLinkClick(services: IServiceCollection) {
  const serviceName = ExtensionServiceName.onFileLinkClick;
  services.addSingleton(
    serviceName,
    (container: IDomainServices) => {
      // create the event handler
      const handler = new OnFileLinkClick(
        new VsCodeConstructionFactory(),
        window,
        env,
        container.loggerFactory.create(serviceName)
      );

      // register the vscode command
      handler.disposable = commands.registerCommand(
        SuggestionCommandFeatures.OnFileLinkClick,
        handler.execute,
        handler
      );

      return handler;
    },
    true
  )
}

export function addOnUpdateDependencyClick(services: IServiceCollection) {
  const serviceName = ExtensionServiceName.onUpdateDependencyClick;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      // create the event handler
      const handler = new OnUpdateDependencyClick(
        new VsCodeConstructionFactory(),
        workspace,
        container.versionLensState,
        container.loggerFactory.create(serviceName)
      );

      // register the vscode command
      handler.disposable = commands.registerCommand(
        SuggestionCommandFeatures.OnUpdateDependencyClick,
        handler.execute,
        handler
      );

      return handler;
    },
    true
  )
}

export function addOnChooseBuildClick(services: IServiceCollection) {
  const serviceName = ExtensionServiceName.onChooseBuildClick;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      // create the event handler
      const handler = new OnChooseBuildClick(
        new SuggestionInteractions(window),
        new VsCodeConstructionFactory(),
        workspace,
        container.versionLensState,
        container.loggerFactory.create(serviceName)
      );

      // register the vscode command
      handler.disposable = commands.registerCommand(
        SuggestionCommandFeatures.OnChooseBuildClick,
        handler.execute,
        handler
      );

      return handler;
    },
    true
  )
}

export function addOnRefreshSuggestionsStats(services: IServiceCollection) {
  const serviceName = ExtensionServiceName.onRefreshSuggestionsStats;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100)

      // create the event handler
      const event = new OnRefreshSuggestionsStats(
        statusBarItem,
        container.getSuggestionsStats,
        container.versionLensState,
        container.suggestionOptions,
        container.loggerFactory.create(serviceName)
      );

      // schedule every 180 seconds
      const intervalHandle = setInterval(
        async () => event.execute(),
        180 * 1000
      );

      // register disposables
      event.disposables.push(
        // register as a vscode command
        commands.registerCommand(
          SuggestionCommandFeatures.OnRefreshSuggestionsStats,
          event.execute,
          event
        ),
        statusBarItem as any,
        {
          dispose: () => {
            clearInterval(intervalHandle);
          }
        } as any
      );

      // register as a onTextDocumentSave event
      container.onTextDocumentSave.registerListener(event.execute as any, event, 1);

      // run first time
      setTimeout(() => event.execute(), 5000)

      return event;
    },
    true
  )
}