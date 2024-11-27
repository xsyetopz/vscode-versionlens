import type { IUrlAuthenticationSession } from '#domain/authorization';
import type { ICache } from '#domain/caching';
import type { UrlAuthenticationSessionData } from '#extension/authorization';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class UrlAuthenticationSession implements IUrlAuthenticationSession {

  constructor(private authenticationCache: ICache) {
    throwUndefinedOrNull('authenticationCache', this.authenticationCache);
  }

  updateConsent(url: string, value: boolean) {
    const session = this.authenticationCache.get<UrlAuthenticationSessionData>(url);
    session.consent = value;
  }

  incrementRetries(url: string) {
    const session = this.authenticationCache.get<UrlAuthenticationSessionData>(url);
    session.retries++;
  }

  async hasRetries(url: string): Promise<boolean> {
    const session = await this.authenticationCache.getOrCreate<UrlAuthenticationSessionData>(
      url,
      async () => ({ consent: true, retries: 0 })
    );

    return session.consent && session.retries === 0;
  }

  clear(url: string) {
    this.authenticationCache.remove(url);
  }

}