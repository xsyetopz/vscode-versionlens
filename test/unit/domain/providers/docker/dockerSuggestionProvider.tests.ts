import type { ILogger } from '#domain/logging';
import {
  type PackageClientRequest,
  ClientResponseFactory,
  createPackageResource,
  PackageDependency
} from '#domain/packages';
import {
  createPackageNameDesc,
  createPackageVersionDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';
import {
  type DockerConfig,
  type DockerSuggestionResolver,
  DockerSuggestionProvider,
} from '#domain/providers/docker';
import { deepEqual } from 'node:assert';
import { instance, mock } from 'ts-mockito';
import fixtures from './dockerSuggestionProvider.fixtures';

type TestContext = {
  dockerClientMock: DockerSuggestionResolver
  dockerConfigMock: DockerConfig
  loggerMock: ILogger
  put: DockerSuggestionProvider
}

export const dockerSuggestionProviderTests = {

  title: DockerSuggestionProvider.name,

  beforeEach: function (this: TestContext) {
    this.dockerClientMock = mock<DockerSuggestionResolver>()
    this.dockerConfigMock = mock<DockerConfig>()
    this.loggerMock = mock<ILogger>()
    this.put = new DockerSuggestionProvider(
      instance(this.dockerClientMock),
      instance(this.dockerConfigMock),
      instance(this.loggerMock)
    )
  },

  parseDependencies: {
    "parses dockerfiles": function (this: TestContext) {
      const testPackagePath = 'test/path/dockerfile'
      // test
      const actual = this.put.parseDependencies(testPackagePath, fixtures.dockerfile.test)
      // assert
      deepEqual(actual, fixtures.dockerfile.expected)
    },
    "parses docker compose files": function (this: TestContext) {
      // test
      const actual = this.put.parseDependencies('test/path/compose.yaml', fixtures.compose.test)
      // assert
      deepEqual(actual, fixtures.compose.expected)
    }
  },

  fetchSuggestions: {
    "returns not supported suggestion": async function (this: TestContext) {
      const testRepo = '${ARG1}'
      const testRequest = {
        providerName: 'docker',
        attempt: 1,
        clientData: null,
        parsedDependency: new PackageDependency(
          createPackageResource(testRepo, '23', 'test/path'),
          new PackageDescriptor([
            createPackageNameDesc(testRepo, createTextRange(1, 20)),
            createPackageVersionDesc('23', createTextRange(25, 30)),
          ])
        )
      } as PackageClientRequest<null>

      const actual = await this.put.fetchSuggestions(testRequest)
      deepEqual(actual, ClientResponseFactory.createNotSupported())
    },
  }

}