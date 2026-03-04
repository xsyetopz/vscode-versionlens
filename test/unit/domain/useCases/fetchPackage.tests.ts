import { ClientResponseSource, HttpRequestError } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import {
  type PackageClientRequest,
  type PackageClientResponse,
  type PackageNameVersion,
  type PackageResponse,
  type PackageSuggestion,
  createPackageManifest,
  createPackageNameVersion,
  PackageCache,
  PackageDependency,
  PackageManifest,
  PackageSourceType,
  PackageVersionType,
  SuggestionTypes
} from '#domain/packages';
import {
  createPackageNameDesc,
  createPackageVersionDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';
import type { IProviderConfig, ISuggestionProvider } from '#domain/providers';
import { FetchPackage } from '#domain/useCases';
import { test } from 'mocha-ui-esm';
import { deepEqual, equal } from 'node:assert';
import { anything, instance, mock, verify, when } from 'ts-mockito';

type TestContext = {
  loggerMock: ILogger;
  configMock: IProviderConfig,
  providerMock: ISuggestionProvider,
  testLogger: ILogger;
  testConfig: IProviderConfig
  testProvider: ISuggestionProvider;
  testPackageCache: PackageCache,
  testPackageMan: PackageManifest;
  testPackageNameVersion: PackageNameVersion;
  testRequest: PackageClientRequest<any>;
}

export const fetchPackageTests = <any>{

  [test.title]: FetchPackage.name,

  beforeEach: function (this: TestContext) {
    // mocks
    this.loggerMock = mock<ILogger>();
    this.providerMock = mock<ISuggestionProvider>();
    this.configMock = mock<IProviderConfig>();

    // instances
    const testProviderName = "test provider";

    // logger
    this.testLogger = instance(this.loggerMock) as ILogger;

    // config
    this.testConfig = instance(this.configMock);

    // provider
    when(this.providerMock.name).thenReturn(testProviderName);
    when(this.providerMock.config).thenReturn(this.testConfig);
    when(this.providerMock.logger).thenReturn(this.testLogger);
    this.testProvider = instance(this.providerMock);


    this.testPackageCache = new PackageCache([testProviderName]);
    this.testPackageMan = createPackageManifest(
      "testPackageName",
      "1.0.0",
      "test/path"
    );

    this.testPackageNameVersion = createPackageNameVersion(
      this.testPackageMan.name,
      this.testPackageMan.version
    );

    this.testRequest = {
      providerName: testProviderName,
      clientData: {},
      parsedDependency: new PackageDependency(
        this.testPackageMan,
        new PackageDescriptor([
          createPackageNameDesc(this.testPackageMan.name, createTextRange(1, 20)),
          createPackageVersionDesc(this.testPackageMan.version, createTextRange(25, 30)),
        ])
      )
    }
  },

  "returns successful package suggestions": async function (this: TestContext) {
    // setup client response
    const testRespDoc: PackageClientResponse = {
      type: PackageVersionType.Version,
      source: PackageSourceType.Registry,
      responseStatus: {
        status: 202,
        source: ClientResponseSource.local
      },
      resolved: this.testPackageNameVersion,
      suggestions: [
        <PackageSuggestion>{
          name: this.testPackageMan.name,
          version: "1.0.0",
          type: SuggestionTypes.release
        }
      ]
    };

    // setup suggestion response
    const expected = [
      <PackageResponse>{
        providerName: this.testProvider.name,
        type: testRespDoc.type,
        packageSource: testRespDoc.source,
        fetchedPackage: testRespDoc.resolved,
        parsedDependency: new PackageDependency(
          this.testPackageMan,
          new PackageDescriptor([
            createPackageNameDesc(this.testPackageMan.name, createTextRange(1, 20)),
            createPackageVersionDesc(this.testPackageMan.version, createTextRange(25, 30)),
          ])
        ),
        suggestion: testRespDoc.suggestions[0],
        order: 0
      }
    ]

    // setup client
    when(this.providerMock.fetchSuggestions(this.testRequest)).thenResolve(testRespDoc);

    // create the use case
    const useCase = new FetchPackage(this.testPackageCache, this.testLogger);

    // test
    const actual = await useCase.execute(this.testProvider, this.testRequest);

    // verify
    const expectedPackage = this.testRequest.parsedDependency.package;
    verify(
      this.loggerMock.trace("fetching {packageName}", expectedPackage.name)
    ).once();

    verify(
      this.loggerMock.info(
        'fetched from {source} {packageName}@{packageVersion} ({duration} ms)',
        'client',
        expectedPackage.name,
        expectedPackage.version,
        anything()
      )
    ).once();

    verify(this.providerMock.fetchSuggestions(this.testRequest)).once();

    // assert
    equal(actual.length, 1);
    deepEqual(actual, expected);
  },

  "writes error status code to log for packages with handled errors":
    async function (this: TestContext) {
      // response
      const testRespDoc: PackageClientResponse = {
        type: PackageVersionType.Version,
        source: PackageSourceType.Registry,
        responseStatus: {
          status: 401,
          source: ClientResponseSource.local,
          rejected: true
        },
        resolved: this.testPackageNameVersion,
        suggestions: [
          <PackageSuggestion>{
            name: this.testPackageMan.name,
            version: "1.0.0",
            type: SuggestionTypes.release
          }
        ]
      };

      // client
      when(this.providerMock.fetchSuggestions(this.testRequest))
        .thenReject(
          new HttpRequestError(
            testRespDoc.responseStatus!.source,
            testRespDoc.responseStatus!.status,
            ''
          ) as any
        );

      // create the use case
      const useCase = new FetchPackage(this.testPackageCache, this.testLogger);

      // test
      await useCase.execute(this.testProvider, this.testRequest);

      // verify
      verify(this.providerMock.fetchSuggestions(this.testRequest)).once();
      verify(
        this.loggerMock.error(
          "{packageName}@{packageVersion} was rejected with the status code {responseStatus}",
          this.testRequest.parsedDependency.package.name,
          this.testRequest.parsedDependency.package.version,
          testRespDoc.responseStatus?.status
        )
      ).once();
    },

};