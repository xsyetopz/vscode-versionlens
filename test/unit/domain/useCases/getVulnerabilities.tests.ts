import {
  type OsvClientResponse,
  ClientResponseSource,
  OsvClient
} from '#domain/clients';
import type { ILogger } from '#domain/logging';
import { GetVulnerabilities } from '#domain/useCases';
import { deepEqual } from 'node:assert';
import { instance, mock, verify, when } from 'ts-mockito';

type TestContext = {
  osvClientMock: OsvClient
  loggerMock: ILogger
  cut: GetVulnerabilities
}

export const GetVulnerabilitiesTests = {

  title: GetVulnerabilities.name,

  beforeEach: function (this: TestContext) {
    this.osvClientMock = mock<OsvClient>();
    this.loggerMock = mock<ILogger>();
    this.cut = new GetVulnerabilities(
      instance(this.osvClientMock),
      instance(this.loggerMock)
    );
  },

  "executes OSV query for supported providers": async function (this: TestContext) {
    const testProvider = 'pypi'
    const testPackage = 'jinja2'
    const testVersion = '2.4.1'
    const testRange = { start: 10, end: 20 };

    const testVulns = [
      {
        id: 'GHSA-1',
        modified: '2023-01-01T00:00:00Z',
        summary: 'Test Vuln'
      }
    ];

    const testResponse: OsvClientResponse = {
      status: 200,
      data: testVulns,
      source: ClientResponseSource.remote
    };

    when(this.osvClientMock.query(testPackage, 'PyPI', testVersion))
      .thenResolve(testResponse);

    const expectedVulns = [
      {
        id: 'GHSA-1',
        range: testRange,
        msg: `Vulnerability found in ${testPackage}@${testVersion}:\nGHSA-1: Test Vuln`,
        url: 'https://osv.dev/vulnerability/GHSA-1'
      }
    ];

    // test
    const actual = await this.cut.execute(testProvider, testPackage, testVersion, testRange);

    // assert
    deepEqual(actual.vulnerabilities, expectedVulns)
  },

  "strips range operators for OSV query": async function (this: TestContext) {
    const testProvider = 'pypi'
    const testPackage = 'jinja2'
    const testRangeVersion = '>=2.4.1'
    const strippedVersion = '2.4.1'
    const testRange = { start: 10, end: 20 };

    const testVulns = [
      {
        id: 'GHSA-1',
        modified: '2023-01-01T00:00:00Z',
        summary: 'Test Vuln'
      }
    ];

    const testResponse: OsvClientResponse = {
      status: 200,
      data: testVulns,
      source: ClientResponseSource.remote
    };

    // expect query with strippedVersion (2.4.1) not range (>=2.4.1)
    when(this.osvClientMock.query(testPackage, 'PyPI', strippedVersion))
      .thenResolve(testResponse);

    const expectedVulns = [
      {
        id: 'GHSA-1',
        range: testRange,
        msg: `Vulnerability found in ${testPackage}@${strippedVersion}:\nGHSA-1: Test Vuln`,
        url: 'https://osv.dev/vulnerability/GHSA-1'
      }
    ];

    // test
    const actual = await this.cut.execute(testProvider, testPackage, testRangeVersion, testRange);

    // assert
    deepEqual(actual.vulnerabilities, expectedVulns)
  },

  "strips complex range operators for OSV query": async function (this: TestContext) {
    const testProvider = 'npm'
    const testPackage = 'pkg'
    const testRangeVersion = '> 7.0.0 < 7.6.0'
    const strippedVersion = '7.0.0'
    const testRange = { start: 10, end: 20 };

    // expect query with first version found (7.0.0)
    when(this.osvClientMock.query(testPackage, 'npm', strippedVersion))
      .thenResolve({ status: 200, data: [], source: ClientResponseSource.remote });

    // test
    await this.cut.execute(testProvider, testPackage, testRangeVersion, testRange);

    // verify
    verify(this.osvClientMock.query(testPackage, 'npm', strippedVersion)).once();
  },

  "executes OSV query for Cargo (crates.io)": async function (this: TestContext) {
    const testProvider = 'cargo'
    const testPackage = 'rand'
    const testVersion = '0.7.2'
    const testRange = { start: 5, end: 10 };

    when(this.osvClientMock.query(testPackage, 'crates.io', testVersion))
      .thenResolve({ status: 200, data: [], source: ClientResponseSource.remote });

    // test
    await this.cut.execute(testProvider, testPackage, testVersion, testRange);

    // verify
    verify(this.osvClientMock.query(testPackage, 'crates.io', testVersion)).once();
  },

  "returns empty for unsupported providers": async function (this: TestContext) {
    const testProvider = 'unknown'
    const testPackage = 'pkg'
    const testVersion = '1.0.0'
    const testRange = { start: 5, end: 15 };

    // test
    const actual = await this.cut.execute(testProvider, testPackage, testVersion, testRange);

    // assert
    deepEqual(actual.vulnerabilities, [])
  }

}