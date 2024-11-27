import type { IAuthorization, IUrlAuthenticationSession } from '#domain/authorization';
import {
  type HttpClientOptions,
  type HttpClientResponse,
  type IHttpClient,
  ClientResponseSource,
  HttpClientRequestMethods
} from '#domain/clients';
import type { IXhrRequest, IXhrResponse } from '#domain/clients/requestLight';
import { type KeyStringDictionary, createUrl } from '#domain/utils';
import { throwUndefinedOrNull } from '@esm-test/guards';
import { parse } from 'node:url';

export const httpClientDefaultHeaders = {
  'user-agent': 'vscode-versionlens (gitlab.com/versionlens/vscode-versionlens)'
};

export class RequestLightClient implements IHttpClient {

  constructor(
    readonly requestLight: IXhrRequest,
    readonly authorization: IAuthorization,
    readonly authenticationSession: IUrlAuthenticationSession,
    readonly options: HttpClientOptions
  ) {
    throwUndefinedOrNull('requestLight', requestLight);
    throwUndefinedOrNull('authorization', authorization);
    throwUndefinedOrNull('authenticationSession', authenticationSession);
    throwUndefinedOrNull('options', options);
  }

  async get(
    baseUrl: string,
    query: KeyStringDictionary = {},
    headers: KeyStringDictionary = {}
  ): Promise<HttpClientResponse> {
    const url = createUrl(baseUrl, query);
    const parsedBaseUrl = parse(baseUrl, false);
    const host = `${parsedBaseUrl.protocol}//${parsedBaseUrl.host}`;

    try {
      const shouldAutoAuthorize = !headers.Authorization
        && this.authorization.isUrlAuthorized(host);

      if (shouldAutoAuthorize) {
        const authToken = await this.authorization.getToken(host);
        if (authToken) headers.Authorization = authToken;
      }

      const requestHeaders = { ...headers, ...httpClientDefaultHeaders };

      // make the request
      const response = await this.requestLight.xhr({
        url,
        type: HttpClientRequestMethods.get,
        headers: requestHeaders,
        strictSSL: this.options.http.strictSSL
      });

      // return the response
      const result: HttpClientResponse = {
        source: ClientResponseSource.remote,
        status: response.status,
        data: response.responseText,
        rejected: false
      };

      return result;
    } catch (error) {
      if (error instanceof Error) throw error;

      const errorResponse = error as IXhrResponse;

      // retry when the status is 401
      if (errorResponse.status === 401) {
        const retry = await this.tryAuthorize(host);
        if (retry) return await this.get(baseUrl, query, headers);
      }

      // throw the error response
      const result: HttpClientResponse = {
        source: ClientResponseSource.remote,
        status: errorResponse.status,
        data: errorResponse.responseText,
        rejected: true
      };

      throw result;
    }
  }

  async tryAuthorize(host: string): Promise<Boolean> {
    const retry = await this.authenticationSession.hasRetries(host);
    if (retry === false) return false;

    // update retries made
    this.authenticationSession.incrementRetries(host);

    // check user gave consent
    const consent = await this.authorization.getConsent(host);

    // update consent
    this.authenticationSession.updateConsent(host, consent);

    return consent;
  }

}