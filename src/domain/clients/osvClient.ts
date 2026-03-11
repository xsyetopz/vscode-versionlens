import type { CachingOptions, IExpiryCache } from '#domain/caching';
import {
  type IJsonHttpClient,
  type OsvClientResponse,
  type OsvQueryApiResult,
  ClientResponseSource
} from '#domain/clients';
import { throwUndefinedOrNull } from '@esm-test/guards';

/**
 * Client for interacting with the OSV (Open Source Vulnerabilities) API.
 */
export class OsvClient {

  /**
   * Initializes a new instance of the OsvClient class.
   * @param caching Caching options for requests.
   * @param jsonClient The JSON HTTP client.
   * @param requestCache The cache for OSV responses.
   */
  constructor(
    readonly caching: CachingOptions,
    readonly jsonClient: IJsonHttpClient,
    readonly requestCache: IExpiryCache<OsvClientResponse>
  ) {
    throwUndefinedOrNull('caching', caching);
    throwUndefinedOrNull('jsonClient', jsonClient);
    throwUndefinedOrNull('requestCache', requestCache);
  }

  /**
   * Queries the OSV API for vulnerabilities in a package.
   * @param packageName The name of the package.
   * @param ecosystem The ecosystem the package belongs to.
   * @param version The version of the package.
   * @returns A promise resolving to the list of vulnerabilities.
   */
  async query(
    packageName: string,
    ecosystem: string,
    version: string
  ): Promise<OsvClientResponse> {
    const url = 'https://api.osv.dev/v1/query';
    const data = {
      package: {
        name: packageName,
        ecosystem: ecosystem
      },
      version: version
    };

    const cacheKey = `${ecosystem}:${packageName}:${version}`;

    // check cache
    const cached = this.requestCache.get(cacheKey, this.caching.duration);
    if (cached) return { ...cached, source: ClientResponseSource.cache };

    // fetch
    const jsonResponse = await this.jsonClient.post<OsvQueryApiResult>(url, data);

    // reduce
    const vulns = jsonResponse.data?.vulns ?? [];

    // cache and return
    const result: OsvClientResponse = {
      ...jsonResponse,
      data: vulns
    };

    return this.requestCache.set(cacheKey, result);
  }

}