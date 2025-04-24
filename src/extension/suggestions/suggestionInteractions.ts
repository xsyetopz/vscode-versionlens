import type { IVsCodeWindow } from '#extension/vscode';
import { throwUndefinedOrNull } from '@esm-test/guards';
import type { QuickPickItem } from 'vscode';

export class SuggestionInteractions {

  constructor(readonly window: IVsCodeWindow) {
    throwUndefinedOrNull('window', window);
  }

  async chooseBuild(buildVersions: string[], packageName: string, packageVersion: string): Promise<string | undefined> {
    const pickItems = buildVersions.map(x => <QuickPickItem>{ label: x, picked: x === packageVersion });
    // show interactive choices
    const selected = await this.window.showQuickPick(
      pickItems,
      {
        title: `Choose a build for ${packageName}`,
        placeHolder: "Choose a build or press escape to cancel",
      }
    );
    if (!selected) return;

    return selected.label;
  }


}