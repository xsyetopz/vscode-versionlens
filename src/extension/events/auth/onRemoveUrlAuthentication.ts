import type { ILogger } from '#domain/logging';
import type { PackageCache } from '#domain/packages';
import { type KeyDictionary, Disposable } from '#domain/utils';
import {
  type AuthenticationProvider,
  type UrlAuthenticationStore,
  AuthenticationInteractions
} from '#extension/authorization';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class OnRemoveUrlAuthentication extends Disposable {

  constructor(
    readonly providers: KeyDictionary<AuthenticationProvider>,
    readonly urlAuthStore: UrlAuthenticationStore,
    readonly packageCache: PackageCache,
    readonly interactions: AuthenticationInteractions,
    readonly logger: ILogger
  ) {
    super();
    throwUndefinedOrNull('providers', providers);
    throwUndefinedOrNull('urlAuthStore', urlAuthStore);
    throwUndefinedOrNull('packageCache', packageCache);
    throwUndefinedOrNull('interactions', interactions);
    throwUndefinedOrNull('logger', logger);
  }

  async execute() {
    // get all the url authentications
    const data = this.urlAuthStore.getAll();

    // sort the list
    data.sort();

    // ask the user which url(s) to remove
    const authDataToClear = await this.interactions.chooseUrlAuthToClear(data);
    if (authDataToClear.length === 0) return;

    // clear url authentication
    for (const authItem of authDataToClear) {
      this.logger.info(`Clearing %s authentication`, authItem.url);

      // clear url auth persistence
      await this.urlAuthStore.remove(authItem.url);

      // clear secret auth persistence
      await this.providers[authItem.scheme].remove(authItem.id);
    }

    // clear package cache
    this.logger.info('Clearing package caches');
    this.packageCache.clear();
  }

}