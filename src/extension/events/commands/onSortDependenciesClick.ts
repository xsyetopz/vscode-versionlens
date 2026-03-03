import { DependencyCache } from '#domain/packages';
import { GetSuggestionProvider, SortDependencies } from '#domain/useCases';
import { Disposable } from '#domain/utils';
import { IVersionLensState } from '#extension';
import { IVsCodeConstructFactory, IVsCodeWorkspace } from '#extension/vscode';
import { throwUndefinedOrNull } from '@esm-test/guards';
import { TextEditor } from 'vscode';

/**
 * Event handler for when the sort dependencies toolbar icon is clicked.
 */
export class OnSortDependenciesClick extends Disposable {

  /**
   * Initializes a new instance of the OnSortDependenciesClick class.
   * @param construct Factory for VS Code constructs.
   * @param workspace VS Code workspace interface.
   * @param state Extension state.
   * @param getSuggestionProvider Use case for identifying suggestion providers.
   * @param sortDependencies Use case for sorting dependencies.
   * @param dependencyCache Cache for storing parsed dependencies.
   */
  constructor(
    readonly construct: IVsCodeConstructFactory,
    readonly workspace: IVsCodeWorkspace,
    readonly state: IVersionLensState,
    readonly getSuggestionProvider: GetSuggestionProvider,
    readonly sortDependencies: SortDependencies,
    readonly dependencyCache: DependencyCache
  ) {
    super();
    throwUndefinedOrNull('construct', construct);
    throwUndefinedOrNull('workspace', workspace);
    throwUndefinedOrNull('state', state);
    throwUndefinedOrNull('getSuggestionProvider', getSuggestionProvider);
    throwUndefinedOrNull('sortDependencies', sortDependencies);
    throwUndefinedOrNull('dependencyCache', dependencyCache);
  }

  /**
   * Executes the sort dependencies command.
   * @param textEditor The active text editor.
   */
  async execute(textEditor?: TextEditor): Promise<void> {
    if (!textEditor) return;

    const document = textEditor.document;
    const provider = this.getSuggestionProvider.execute(document.fileName);
    if (!provider) return;

    // get the identified dependencies from the cache
    let dependencies = this.dependencyCache.get(provider.name, document.fileName);
    if (!dependencies || dependencies.length === 0) {
      // fallback to parsing the document
      dependencies = provider.parseDependencies(document.fileName, document.getText());
    }

    if (!dependencies || dependencies.length === 0) return;

    // get the sort edits
    const edits = this.sortDependencies.execute(document.getText(), dependencies);
    if (edits.length === 0) return;

    // apply the edits
    const workspaceEdit = this.construct.createWorkspaceEdit();
    for (const edit of edits) {
      const range = this.construct.createRange(
        document.positionAt(edit.range.start),
        document.positionAt(edit.range.end)
      );
      workspaceEdit.replace(document.uri, range, edit.newText);
    }

    await this.workspace.applyEdit(workspaceEdit);
  }

}
