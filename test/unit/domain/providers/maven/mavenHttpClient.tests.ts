import { type IHttpClient, type JsonClientResponse, ClientResponseSource } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import { MavenHttpClient } from '#domain/providers/maven';
import { deepEqual } from 'node:assert';
import { instance, mock, when } from 'ts-mockito';
import Fixtures from './mavenHttpClient.fixtures';

type TestContext = {
  httpClientMock: IHttpClient;
  loggerMock: ILogger;
}

export const MavenHttpClientTests = {

  title: MavenHttpClient.name,

  beforeEach: function (this: TestContext) {
    this.httpClientMock = mock<IHttpClient>();
    this.loggerMock = mock<ILogger>();
  },

  get: {
    "fetches from single url": async function (this: TestContext) {
      // setup
      const testGroup = 'junit'
      const testArtifact = 'junit'
      const testPackageName = `${testGroup}:${testArtifact}`
      const testRepoUrl = 'https://api/';
      const testUrl = `${testRepoUrl}${testGroup}/${testArtifact}/maven-metadata.xml`;
      const testResp = {
        data: Fixtures.get.test,
        source: ClientResponseSource.remote,
        status: 200
      }
      const expectedResp = {
        data: Fixtures.get.expected,
        source: ClientResponseSource.remote,
        status: 200
      }
      const cut = new MavenHttpClient(instance(this.httpClientMock), instance(this.loggerMock));
      when(this.httpClientMock.get(testUrl)).thenResolve(testResp)

      // test
      const actual = await cut.get(testPackageName, [testRepoUrl])
      // assert
      deepEqual(actual, expectedResp)
    },

    "attempts fallback url when 404": async function (this: TestContext) {
      const testGroup = 'junit'
      const testArtifact = 'junit'
      const testPackageName = `${testGroup}:${testArtifact}`
      const failUrl = `http://failed/`
      const successUrl = `http://success/`
      const testFailResp: JsonClientResponse<any> = {
        data: [],
        source: ClientResponseSource.remote,
        status: 404,
        rejected: true
      }
      const successResp: JsonClientResponse<any> = {
        data: [],
        source: ClientResponseSource.remote,
        status: 200,
        rejected: false
      }

      when(this.httpClientMock.get(`${failUrl}${testGroup}/${testArtifact}/maven-metadata.xml`))
        .thenReject(testFailResp as any)

      when(this.httpClientMock.get(`${successUrl}${testGroup}/${testArtifact}/maven-metadata.xml`))
        .thenResolve(successResp as any)

      const cut = new MavenHttpClient(instance(this.httpClientMock), instance(this.loggerMock))

      // test
      const actual = await cut.get(testPackageName, [failUrl, successUrl])

      // assert
      deepEqual(actual, successResp)
    }
  },

}