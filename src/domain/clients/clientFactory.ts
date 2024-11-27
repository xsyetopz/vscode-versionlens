import type { IAuthorization, IUrlAuthenticationSession } from '#domain/authorization';
import type { ICachingOptions, IExpiryCache } from '#domain/caching';
import {
  type IHttpClient,
  type IJsonHttpClient,
  type IShellClient,
  HttpClientOptions,
  JsonHttpClient
} from '#domain/clients';
import { PromiseSpawnClient } from '#domain/clients/promiseSpawn';
import { RequestLightClient } from "#domain/clients/requestLight";
import type { ILogger } from '#domain/logging';
import PromiseSpawn from '@npmcli/promise-spawn';
import * as RequireLight from 'request-light';

export function createShellClient(
  shellCache: IExpiryCache,
  cachingOpts: ICachingOptions,
  logger: ILogger
): IShellClient {
  return new PromiseSpawnClient(PromiseSpawn, shellCache, cachingOpts, logger);
}

export function createHttpClient(
  authorization: IAuthorization,
  authenticationSession: IUrlAuthenticationSession,
  options: HttpClientOptions
): IHttpClient {
  return new RequestLightClient(
    RequireLight,
    authorization,
    authenticationSession,
    options
  );
}

export function createJsonClient(
  authorization: IAuthorization,
  authenticationSession: IUrlAuthenticationSession,
  options: HttpClientOptions
): IJsonHttpClient {
  return new JsonHttpClient(
    createHttpClient(
      authorization,
      authenticationSession,
      options
    )
  );
}