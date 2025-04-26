import { type IJsonHttpClient, ClientResponseSource } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import { type DubConfig, DubJsonClient } from '#domain/providers/dub';
import { deepEqual } from 'node:assert';
import { anything, instance, mock, when } from 'ts-mockito';
import fixtures from './dubJsonClient.fixtures';

type TestContext = {
  configMock: DubConfig;
  jsonClientMock: IJsonHttpClient;
  loggerMock: ILogger;
}

export const DubJsonClientTests = {

  title: DubJsonClient.name,

  beforeEach: function (this: TestContext) {
    this.configMock = mock<DubConfig>();
    this.jsonClientMock = mock<IJsonHttpClient>();
    this.loggerMock = mock<ILogger>();
  },

  get: async function (this: TestContext) {
    // setup
    const testPackageName = 'test-package-name'
    const testApiUrl = `https://api/`;
    const testUrl = `${testApiUrl}${testPackageName}/info`;
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
    const cut = new DubJsonClient(
      instance(this.configMock),
      instance(this.jsonClientMock),
      instance(this.loggerMock)
    );

    when(this.configMock.apiUrl).thenReturn(testApiUrl)
    when(this.jsonClientMock.get(testUrl, anything())).thenResolve(testResp)

    // test
    const actual = await cut.get(testPackageName)
    // assert
    deepEqual(actual, expectedResp)
  }

}