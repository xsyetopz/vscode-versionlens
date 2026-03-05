import type { IExpiryCache } from '#domain/caching';
import { type IJsonHttpClient, ClientResponseSource } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import type { RubyConfig, RubyHttpClientResponse } from '#domain/providers/ruby';
import { throwUndefinedOrNull } from '@esm-test/guards';

/**
 * Client for fetching package version data from the RubyGems registry.
 */
export class RubyHttpClient {

  /**
   * Initializes a new instance of the RubyHttpClient class.
   * @param config The configuration for the Ruby provider.
   * @param jsonClient The JSON HTTP client for making requests.
   * @param requestCache The cache for registry responses.
   * @param logger The logger for this client.
   */
  constructor(
    readonly config: RubyConfig,
    readonly jsonClient: IJsonHttpClient,
    readonly requestCache: IExpiryCache<RubyHttpClientResponse>,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('jsonClient', jsonClient);
    throwUndefinedOrNull('requestCache', requestCache);
    throwUndefinedOrNull('logger', logger);
  }

  /**
   * Fetches version information for a given package from the RubyGems API.
   * @param packageName The name of the package.
   * @returns A promise resolving to the Ruby HTTP client response.
   */
  async get(packageName: string): Promise<RubyHttpClientResponse> {
    const url = this.config.apiUrl.replace('{name}', packageName);
    // check cache
    const cached = this.requestCache.get(url, this.config.caching.duration);
    if (cached) return { ...cached, source: ClientResponseSource.cache };
    // fetch
    const response = await this.jsonClient.get<any[]>(url);
    // reduce to version numbers
    const data = response.data.map(x => x.number);
    // cache and return
    const result: RubyHttpClientResponse = { ...response, data };
    return this.requestCache.set(url, result);
  }

}
