import { type JsonHttpClient, ClientResponseSource } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import { GoHttpClient, type GoConfig } from '#domain/providers/golang';
import { deepEqual } from 'node:assert';
import { instance, mock, when } from 'ts-mockito';
import fixtures from './goHttpClient.fixtures';

type TestContext = {
  configMock: GoConfig;
  jsonClientMock: JsonHttpClient;
  loggerMock: ILogger;
}

export const GoHttpClientTests = {

  title: GoHttpClient.name,

  beforeEach: function (this: TestContext) {
    this.configMock = mock<GoConfig>();
    this.jsonClientMock = mock<JsonHttpClient>();
    this.loggerMock = mock<ILogger>();
  },

  get: async function (this: TestContext) {
    // setup
    const testPackageName = 'test-package-name'
    const testApiUrl = 'https://api/{base-module}/@v/list';
    const testUrl = `https://api/${testPackageName}/@v/list`;
    const testResp = {
      data: fixtures.test,
      source: ClientResponseSource.remote,
      status: 200
    }
    const expectedResp = {
      data: fixtures.expected,
      source: ClientResponseSource.remote,
      status: 200
    }
    const cut = new GoHttpClient(
      instance(this.configMock),
      instance(this.jsonClientMock),
      instance(this.loggerMock)
    );

    when(this.configMock.apiUrl).thenReturn(testApiUrl)
    when(this.jsonClientMock.get(testUrl)).thenResolve(testResp)

    // test
    const actual = await cut.get(testPackageName)
    // assert
    deepEqual(actual, expectedResp)
  }

}