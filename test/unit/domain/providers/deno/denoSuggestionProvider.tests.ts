import type { ILogger } from '#domain/logging';
import {
  type DenoConfig,
  type DenoSuggestionResolver,
  DenoSuggestionProvider
} from '#domain/providers/deno';
import type { NpmSuggestionProvider } from '#domain/providers/npm';
import { equal } from 'node:assert';
import { instance, mock, when } from 'ts-mockito';

type TestContext = {
  resolverMock: DenoSuggestionResolver
  configMock: DenoConfig
  loggerMock: ILogger
  npmSuggestionProviderMock: NpmSuggestionProvider
  put: DenoSuggestionProvider
}

export const denoSuggestionProviderTests = {

  title: DenoSuggestionProvider.name,

  beforeEach: function (this: TestContext) {
    this.resolverMock = mock<DenoSuggestionResolver>()
    this.configMock = mock<DenoConfig>()
    this.npmSuggestionProviderMock = mock<NpmSuggestionProvider>()
    this.loggerMock = mock<ILogger>()
    this.put = new DenoSuggestionProvider(
      instance(this.resolverMock),
      instance(this.configMock),
      instance(this.npmSuggestionProviderMock),
      instance(this.loggerMock)
    )
  },

  "parses dependencies": function (this: TestContext) {
    const testPackagePath = 'test/path/deno.json'
    const testProps = ['imports'];
    const testContent = '{}'
    const expected = {}
    when(this.configMock.dependencyProperties).thenReturn(testProps);
    when(
      this.npmSuggestionProviderMock.parseDependencies(
        testPackagePath,
        testContent,
        testProps
      )
    ).thenReturn(expected as any);
    // test
    const actual = this.put.parseDependencies(testPackagePath, testContent)
    // assert
    equal(actual, expected)
  },

}