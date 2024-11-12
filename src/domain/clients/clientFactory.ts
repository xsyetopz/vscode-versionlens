import { ICachingOptions, IExpiryCache } from '#domain/caching';
import {
  HttpClientOptions,
  IHttpClient,
  IJsonHttpClient,
  IProcessClient,
  JsonHttpClient
} from '#domain/clients';
import { PromiseSpawnClient } from '#domain/clients/promiseSpawn';
import { RequestLightClient } from "#domain/clients/requestLight";
import { ILogger } from '#domain/logging';
import PromiseSpawn from '@npmcli/promise-spawn';
import * as RequireLight from 'request-light';

export function createProcessClient(
  processCache: IExpiryCache,
  cachingOpts: ICachingOptions,
  logger: ILogger
): IProcessClient {
  return new PromiseSpawnClient(PromiseSpawn, processCache, cachingOpts, logger);
}

export function createHttpClient(
  options: HttpClientOptions,
  logger: ILogger
): IHttpClient {
  return new RequestLightClient(RequireLight.xhr, options, logger);
}

export function createJsonClient(
  options: HttpClientOptions,
  logger: ILogger
): IJsonHttpClient {
  return new JsonHttpClient(createHttpClient(options, logger));
}