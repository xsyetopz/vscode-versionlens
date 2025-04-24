import type { IHttpClient } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import type { GoApiClientResponse, GoConfig } from '#domain/providers/golang';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class GoHttpClient {

  constructor(
    readonly config: GoConfig,
    readonly httpClient: IHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('httpClient', httpClient);
    throwUndefinedOrNull('logger', logger);
  }

  async get(packageName: string): Promise<GoApiClientResponse> {
    const url = this.config.apiUrl.replace('{base-module}', packageName.toLowerCase());
    const httpResponse = await this.httpClient.get(url);

    // reduce the dataset
    const data = {
      versions: httpResponse.data.split('\n').filter(x => !!x)
    };

    // return the response
    return { ...httpResponse, data };
  }

}