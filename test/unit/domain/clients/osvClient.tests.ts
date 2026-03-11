import { type CachingOptions, MemoryExpiryCache } from '#domain/caching';
import {
  type IJsonHttpClient,
  ClientResponseSource,
  OsvClient
} from '#domain/clients';
import { deepEqual } from 'node:assert';
import { deepEqual as matchDeep, instance, mock, when } from 'ts-mockito';

type TestContext = {
  cachingMock: CachingOptions
  jsonClientMock: IJsonHttpClient
  requestCache: MemoryExpiryCache
  cut: OsvClient
}

export const OsvClientTests = {

  title: OsvClient.name,

  beforeEach: function (this: TestContext) {
    this.cachingMock = mock<CachingOptions>();
    this.jsonClientMock = mock<IJsonHttpClient>();
    this.requestCache = new MemoryExpiryCache('test-cache');
    this.cut = new OsvClient(
      instance(this.cachingMock),
      instance(this.jsonClientMock),
      this.requestCache
    );
  },

  "queries vulnerabilities": async function (this: TestContext) {
    const testPackage = 'jinja2'
    const testEcosystem = 'PyPI'
    const testVersion = '2.4.1'
    const testUrl = 'https://api.osv.dev/v1/query'
    const testVulns = [
      { id: 'GHSA-1', modified: '2023-01-01T00:00:00Z', summary: 'Test Vuln' }
    ];

    const testData = {
      package: {
        name: testPackage,
        ecosystem: testEcosystem
      },
      version: testVersion
    };

    when(this.jsonClientMock.post(testUrl, matchDeep(testData)))
      .thenResolve({
        status: 200,
        data: { vulns: testVulns },
        source: ClientResponseSource.remote
      });

    // test
    const actual = await this.cut.query(testPackage, testEcosystem, testVersion);

    // assert
    deepEqual(actual.data, testVulns)
    const cacheKey = `${testEcosystem}:${testPackage}:${testVersion}`;
    deepEqual(this.requestCache.get(cacheKey, 3000), actual)
  }

}