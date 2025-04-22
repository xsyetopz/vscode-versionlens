import { ILogger } from '#domain/logging';
import {
  DockerClient,
  DockerConfig,
  DockerSuggestionProvider
} from '#domain/providers/docker';
import { deepEqual } from 'node:assert';
import { instance, mock } from 'ts-mockito';
import fixtures from './dockerSuggestionProvider.fixtures';

type TestContext = {
  dockerClientMock: DockerClient
  dockerConfigMock: DockerConfig
  loggerMock: ILogger
}

export const dockerSuggestionProviderTests = {

  title: DockerSuggestionProvider.name,

  beforeEach: function (this: TestContext) {
    this.dockerClientMock = mock<DockerClient>()
    this.dockerConfigMock = mock<DockerConfig>()
    this.loggerMock = mock<ILogger>()
  },

  "parses dockerfiles": function (this: TestContext) {
    const testPackagePath = 'test/path/dockerfile'
    const put = new DockerSuggestionProvider(
      instance(this.dockerClientMock),
      instance(this.dockerConfigMock),
      instance(this.loggerMock)
    )
    // test
    const actual = put.parseDependencies(testPackagePath, fixtures.dockerfile.test)
    // assert
    deepEqual(actual, fixtures.dockerfile.expected)
  },

  "parses docker compose files": function (this: TestContext) {
    const testPackagePath = 'test/path/compose.yaml'
    const put = new DockerSuggestionProvider(
      instance(this.dockerClientMock),
      instance(this.dockerConfigMock),
      instance(this.loggerMock)
    )
    // test
    const actual = put.parseDependencies(testPackagePath, fixtures.compose.test)
    // assert
    deepEqual(actual, fixtures.compose.expected)
  }

}