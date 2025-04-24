import { type JsonHttpClient, ClientResponseSource } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import { type CargoConfig, CratesClient } from '#domain/providers/cargo';
import { deepEqual } from 'node:assert';
import { instance, mock, when } from 'ts-mockito';
import fixtures from './cratesClient.fixtures';

type TestContext = {
  configMock: CargoConfig;
  jsonClientMock: JsonHttpClient;
  loggerMock: ILogger;
}

export const cratesClientTests = {

  title: CratesClient.name,

  beforeEach: function (this: TestContext) {
    this.configMock = mock<CargoConfig>();
    this.jsonClientMock = mock<JsonHttpClient>();
    this.loggerMock = mock<ILogger>();
  },

  get: async function (this: TestContext) {
    // setup
    const testPackageName = 'test-package-name'
    const testApiUrl = `https://api/`;
    const testUrl = `${testApiUrl}${testPackageName}/versions`;
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
    const cut = new CratesClient(
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