import type { ILogger } from '#domain/logging';
import { Disposable } from '#domain/utils';
import { OnSaveChanges } from '#extension/events';
import { VersionLensState } from '#extension/state';
import { SuggestionCodeLensProvider } from '#extension/suggestions';
import { throwUndefinedOrNull } from '@esm-test/guards';

/**
 * Event handler for when the custom install icon is clicked in the editor title bar.
 */
export class OnCustomInstallClick extends Disposable {

  /**
   * Initializes a new instance of the OnCustomInstallClick class.
   * @param suggestionCodeLensProviders List of active code lens providers.
   * @param state Extension state.
   * @param onSaveChanges Event handler for save changes, which contains the task execution logic.
   * @param logger Logger instance.
   */
  constructor(
    readonly suggestionCodeLensProviders: SuggestionCodeLensProvider[],
    readonly state: VersionLensState,
    readonly onSaveChanges: OnSaveChanges,
    readonly logger: ILogger
  ) {
    super();
    throwUndefinedOrNull("suggestionCodeLensProviders", suggestionCodeLensProviders);
    throwUndefinedOrNull("state", state);
    throwUndefinedOrNull("onSaveChanges", onSaveChanges);
    throwUndefinedOrNull("logger", logger);
  }

  /**
   * Executes the custom install task for the active suggestion provider.
   * Identifies the active provider from the extension state and triggers its configured task.
   */
  async execute(): Promise<void> {
    // get the active provider name from the state
    const providerName = this.state.providerActive.value;

    // find the matching code lens provider
    const activeCodeLensProvider = this.suggestionCodeLensProviders.find(
      x => x.providerName === providerName
    );

    // ensure a task is configured for the provider
    if (!activeCodeLensProvider?.suggestionProvider.config.onSaveChangesTask) {
      this.logger.debug(
        "{providerName} does not have a custom install task configured",
        activeCodeLensProvider?.suggestionProvider.name
      );
      return;
    }

    this.logger.debug(
      "executing custom install task for {providerName}",
      activeCodeLensProvider?.suggestionProvider.name
    );

    // run the task
    await this.onSaveChanges.runTask(activeCodeLensProvider.suggestionProvider);
  }

}