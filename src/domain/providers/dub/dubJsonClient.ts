import type { IJsonHttpClient } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import type { DubApiResult, DubConfig, DubJsonClientResponse } from '#domain/providers/dub';
import { throwUndefinedOrNull } from '@esm-test/guards';

const query = { minimize: 'true' }

export class DubJsonClient {

  constructor(
    readonly config: DubConfig,
    readonly jsonClient: IJsonHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('jsonClient', jsonClient);
    throwUndefinedOrNull('logger', logger);
  }

  async get(packageName: string): Promise<DubJsonClientResponse> {
    const url = `${this.config.apiUrl}${encodeURIComponent(packageName)}/info`;
    // fetch
    const jsonResponse = await this.jsonClient.get<DubApiResult>(url, query);
    // reduce
    const result = {
      ...jsonResponse,
      data: jsonResponse.data.versions.map(x => x.version)
    }
    // return
    return result;
  }

}