import type { ILogger } from '#domain/logging';
import {
  type ComposerConfig,
  type ComposerSuggestionResolver,
  ComposerSuggestionProvider
} from '#domain/providers/composer';
import { deepEqual } from 'node:assert';
import { instance, mock, when } from 'ts-mockito';
import fixtures from './composerSuggestionProvider.fixtures';

type TestContext = {
  resolverMock: ComposerSuggestionResolver
  configMock: ComposerConfig
  loggerMock: ILogger
  put: ComposerSuggestionProvider
}

export const composerSuggestionProviderTests = {

  title: ComposerSuggestionProvider.name,

  beforeEach: function (this: TestContext) {
    this.resolverMock = mock<ComposerSuggestionResolver>()
    this.configMock = mock<ComposerConfig>()
    this.loggerMock = mock<ILogger>()
    this.put = new ComposerSuggestionProvider(
      instance(this.resolverMock),
      instance(this.configMock),
      instance(this.loggerMock)
    )
  },

  "parses dependencies": function (this: TestContext) {
    const testPackagePath = 'test/path/composer.json'
    const testProps = [
      'version',
      'require',
      'require-dev'
    ];
    when(this.configMock.dependencyProperties).thenReturn(testProps);
    // test
    const actual = this.put.parseDependencies(testPackagePath, fixtures.test)
    // assert
    deepEqual(actual, fixtures.expected)
  },

}