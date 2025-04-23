import { MemoryExpiryCache } from '#domain/caching';
import type { IJsonHttpClient } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import {
  DockerConfig,
  DockerHubListClientResponse,
  DockerHubListReposResponse,
  DockerHubListReposResult,
  DockerHubRepository
} from '#domain/providers/docker';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class DockerHubClient {

  constructor(
    readonly config: DockerConfig,
    readonly jsonClient: IJsonHttpClient,
    readonly requestCache: MemoryExpiryCache,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('jsonClient', jsonClient);
    throwUndefinedOrNull('requestCache', requestCache);
    throwUndefinedOrNull('logger', logger);
  }

  async get(repository: string, namespace: string = 'library'): Promise<DockerHubListClientResponse> {
    const url = this.config.apiUrl
      .replace('{namespace}', namespace)
      .replace('{repository}', repository);

    return await this.requestCache.getOrCreate(
      url,
      async () => {
        const results: DockerHubRepository[] = [];
        let jsonResponse: DockerHubListReposResponse;
        let pagedData: DockerHubListReposResult;
        let page = 1;
        do {
          jsonResponse = await this.jsonClient.get(
            url,
            {
              page,
              page_size: 100,
              ordering: 'last_updated'
            }
          );

          if (jsonResponse.rejected) return { ...jsonResponse } as any;

          pagedData = jsonResponse.data;
          results.push(...pagedData.results);
          page++;
        } while (pagedData.next && page < 4)

        return {
          ...jsonResponse,
          data: results
            .filter(x => x.tag_status === 'active')
            .filter(x => !!x.digest)
            .map<DockerHubRepository>(x => ({ name: x.name, digest: x.digest, tag_status: x.tag_status }))
        };
      },
      this.config.caching.duration
    )
  }

}