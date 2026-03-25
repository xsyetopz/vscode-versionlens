import { SuggestionTypes, mapToSuggestionUpdate } from '#domain/packages';
import { GetVulnerabilities } from '#domain/useCases';
import { Disposable } from '#domain/utils';
import type { ISuggestionCodeLens, IVersionLensState } from '#extension';
import type { SuggestionsOptions } from '#extension/suggestions';
import type { IVsCodeConstructFactory, IVsCodeWorkspace } from '#extension/vscode';
import { VulnerabilityInteractions } from '#extension/vulnerabilities';
import { throwUndefinedOrNull } from '@esm-test/guards';

/**
 * Event handler for when an update dependency suggestion is clicked.
 */
export class OnUpdateDependencyClick extends Disposable {

  /**
   * Initializes a new instance of the OnUpdateDependencyClick class.
   * @param construct Factory for VS Code constructs.
   * @param workspace VS Code workspace interface.
   * @param window VS Code window interface.
   * @param getVulnerabilities Use case for fetching vulnerabilities.
   * @param suggestionOptions Suggestion configuration options.
   * @param state Extension state.
   * @param logger Logger instance.
   */
  constructor(
    readonly construct: IVsCodeConstructFactory,
    readonly workspace: IVsCodeWorkspace,
    readonly getVulnerabilities: GetVulnerabilities,
    readonly vulnerabilityInteractions: VulnerabilityInteractions,
    readonly suggestionOptions: SuggestionsOptions,
    readonly state: IVersionLensState
  ) {
    super();
    throwUndefinedOrNull('construct', construct);
    throwUndefinedOrNull('workspace', workspace);
    throwUndefinedOrNull('getVulnerabilities', getVulnerabilities);
    throwUndefinedOrNull('suggestionOptions', suggestionOptions);
    throwUndefinedOrNull('vulnerabilityInteractions', vulnerabilityInteractions);
    throwUndefinedOrNull('state', state);
  }

  /**
   * Executes when a codelens update suggestion is clicked.
   * Applies the version update to the document using a WorkspaceEdit.
   * @param codeLens The clicked code lens.
   */
  async execute(codeLens: ISuggestionCodeLens): Promise<void> {
    if (this.state.codeLensReplace.value === false) return;

    // get the replace version
    const { version, type } = codeLens.packageResponse.suggestion!;
    const isTag = type & SuggestionTypes.tag;
    const suggestionUpdate = mapToSuggestionUpdate(codeLens.packageResponse);
    const replaceWithVersion: string = isTag
      ? version
      : codeLens.replaceVersionFn(suggestionUpdate, version);
    const packageName = codeLens.packageResponse.parsedDependency.package.name;

    // check for vulnerabilities
    if (this.suggestionOptions.showVulnerabilities) {
      const response = await this.getVulnerabilities.execute(
        codeLens.packageResponse.providerName,
        packageName,
        replaceWithVersion,
        codeLens.packageResponse.parsedDependency.versionRange
      );

      const hasVulnerabilities = response.vulnerabilities.length > 0;
      if (hasVulnerabilities && await this.vulnerabilityInteractions.alertUpdateHasVulnerability(packageName, replaceWithVersion)) {
        return;
      }
    }

    // disable codelens replace to prevent suggestion race condition
    await this.state.enableCodeLensReplace(false);

    // apply the edit
    const edit = this.construct.createWorkspaceEdit();
    edit.replace(codeLens.documentUrl, codeLens.replaceRange, replaceWithVersion);
    await this.workspace.applyEdit(edit);
  }

}