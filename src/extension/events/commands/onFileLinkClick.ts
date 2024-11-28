import type { ILogger } from '#domain/logging';
import { Disposable } from '#domain/utils';
import type { IVsCodeEnv } from '#extension';
import type { SuggestionCodeLens } from '#extension/suggestions';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class OnFileLinkClick extends Disposable {

  constructor(readonly env: IVsCodeEnv, readonly logger: ILogger) {
    super();
    throwUndefinedOrNull("env", env);
    throwUndefinedOrNull("logger", logger);
  }

  /**
   * Executes when a codelens file link suggestion is clicked
   * @param codeLens
   */
  async execute(codeLens: SuggestionCodeLens): Promise<void> {
    const filePath = codeLens.packageResponse.fetchedPackage.version;
    await this.env.openExternal(<any>('file:///' + filePath));
  }

}