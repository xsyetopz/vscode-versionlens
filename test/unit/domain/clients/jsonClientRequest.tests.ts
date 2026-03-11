import type { CachingOptions } from '#domain/caching';
import {
  type HttpClientResponse,
  type HttpOptions,
  type IHttpClient,
  ClientResponseSource,
  JsonHttpClient
} from '#domain/clients';
import assert from 'node:assert';
import { anything, deepEqual, instance, mock, when } from 'ts-mockito';

type TestContext = {
  httpClientMock: IHttpClient
  cachingMock: CachingOptions
  httpOptionsMock: HttpOptions
}

export const JsonClientRequestTests = {

  title: JsonHttpClient.name,

  beforeEach: function (this: TestContext) {
    this.httpClientMock = mock<IHttpClient>();
    this.cachingMock = mock<CachingOptions>();
    this.httpOptionsMock = mock<HttpOptions>();
  },

  "get": {

    "returns response as an object": async function (this: TestContext) {
      const testUrl = 'https://test.url.example/path';
      const testQueryParams = { item1: "test" };
      const testResponse: HttpClientResponse = {
        source: ClientResponseSource.remote,
        status: 200,
        data: '{ "result": "success" }',
      }

      const expectedResponseData = {
        source: ClientResponseSource.remote,
        status: testResponse.status,
        data: JSON.parse(testResponse.data),
      }

      when(this.httpClientMock.get(testUrl, testQueryParams, anything())).thenResolve(testResponse)

      const rut = new JsonHttpClient(instance(this.httpClientMock));

      // test
      const actual = await rut.get(testUrl, testQueryParams);

      // assert
      assert.deepEqual(actual, expectedResponseData);
    },

    "returns response from cache": async function (this: TestContext) {
      const testUrl = 'https://test.url.example/path';
      const testQueryParams = { item1: "test" };
      const testResponse: HttpClientResponse = {
        source: ClientResponseSource.cache,
        status: 200,
        data: '{ "result": "success" }',
      }

      const expectedCacheData = {
        source: ClientResponseSource.cache,
        status: testResponse.status,
        data: JSON.parse(testResponse.data),
      }

      when(this.httpClientMock.get(testUrl, testQueryParams, anything())).thenResolve(testResponse)

      const rut = new JsonHttpClient(instance(this.httpClientMock));

      // test
      const actual = await rut.get(testUrl, testQueryParams);

      // assert
      assert.deepEqual(actual, expectedCacheData);
    },

  },

  "post": {

    "returns response as an object": async function (this: TestContext) {
      const testUrl = 'https://test.url.example/path';
      const testData = { item1: "test" };
      const testResponse: HttpClientResponse = {
        source: ClientResponseSource.remote,
        status: 200,
        data: '{ "result": "success" }',
      }

      const expectedResponseData = {
        source: ClientResponseSource.remote,
        status: testResponse.status,
        data: JSON.parse(testResponse.data),
      }

      when(
        this.httpClientMock.post(
          testUrl,
          JSON.stringify(testData),
          deepEqual({}),
          anything()
        )
      ).thenResolve(testResponse)

      const rut = new JsonHttpClient(instance(this.httpClientMock));

      // test
      const actual = await rut.post(testUrl, testData);

      // assert
      assert.deepEqual(actual, expectedResponseData);
    },

  }

};