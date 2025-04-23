import type {
  IHttpClient,
  IJsonHttpClient,
  JsonClientResponse,
  QueryDictionary
} from '#domain/clients';
import type { KeyStringDictionary } from '#domain/utils';
import { throwUndefinedOrNull } from '@esm-test/guards';

export const defaultHeaders = { 'Accept': 'application/json' };

export class JsonHttpClient implements IJsonHttpClient {

  constructor(readonly httpClient: IHttpClient) {
    throwUndefinedOrNull("httpClient", httpClient);
    this.httpClient = httpClient;
  }

  async get<TData>(
    url: string,
    query: QueryDictionary = {},
    headers: KeyStringDictionary = {}
  ): Promise<JsonClientResponse<TData>> {
    const response = await this.httpClient.get(url, query, { ...defaultHeaders, ...headers })
    return {
      source: response.source,
      status: response.status,
      data: JSON.parse(response.data),
    }
  }

}