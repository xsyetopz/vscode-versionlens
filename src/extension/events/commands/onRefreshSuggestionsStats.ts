import type { ILogger } from '#domain/logging';
import type { GetSuggestionsStats } from '#domain/useCases';
import { Disposable } from '#domain/utils';
import type { SuggestionsOptions } from '#extension/suggestions';
import { throwUndefinedOrNull } from '@esm-test/guards';
import type { IVersionLensState } from 'src/extension/definitions.js';
import type { StatusBarItem } from 'vscode';

export class OnRefreshSuggestionsStats extends Disposable {

  constructor(
    readonly statusBarItem: StatusBarItem,
    readonly getSuggestionsStats: GetSuggestionsStats,
    readonly state: IVersionLensState,
    readonly options: SuggestionsOptions,
    readonly logger: ILogger
  ) {
    super();
    throwUndefinedOrNull('statusBarItem', statusBarItem);
    throwUndefinedOrNull('getSuggestionsStats', getSuggestionsStats);
    throwUndefinedOrNull('state', state);
    throwUndefinedOrNull('options', options);
    throwUndefinedOrNull('logger', logger);
  }

  async execute() {
    if (this.state.showSuggestionsStats.value === false) {
      this.statusBarItem.hide();
      return;
    }

    this.logger.info("Fetching all suggestion stats");
    const stats = await this.getSuggestionsStats.execute();
    const builder: string[] = [
      `${this.options.indicators.Match}${stats.updates}`,
      `${this.options.indicators.Error}${stats.errors}`,
      `${this.options.indicators.NoMatch}${stats.noMatches}`
    ];
    this.statusBarItem.text = builder.join(' ');
    this.statusBarItem.show();
    this.logger.info("Completed fetching all suggestion stats");
  }

}