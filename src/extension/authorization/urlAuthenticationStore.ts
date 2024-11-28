import type { KeyDictionary } from '#domain/utils';
import type { UrlAuthenticationData } from '#extension/authorization';
import { throwNotStringOrEmpty, throwUndefinedOrNull } from '@esm-test/guards';
import type { Memento } from 'vscode';

export class UrlAuthenticationStore {

  constructor(readonly storeKey: string, readonly store: Memento) {
    throwNotStringOrEmpty('storeKey', storeKey);
    throwUndefinedOrNull('store', store);
  }

  get(url: string): UrlAuthenticationData {
    return this.getCollection()[url];
  }

  getAll(): UrlAuthenticationData[] {
    const results = [];
    const all = this.getCollection();
    for (const key in all) {
      results.push(all[key]);
    }

    return results;
  }

  async remove(url: string): Promise<void> {
    const map = this.getCollection();
    delete map[url];
    await this.store.update(this.storeKey, map);
  }

  async update(url: string, value: UrlAuthenticationData): Promise<void> {
    const map = this.getCollection();
    map[url] = value;
    await this.store.update(this.storeKey, map);
  }

  async clear() {
    await this.store.update(this.storeKey, {});
  }

  private getCollection(): KeyDictionary<UrlAuthenticationData> {
    return this.store.get(this.storeKey, {});
  }

}