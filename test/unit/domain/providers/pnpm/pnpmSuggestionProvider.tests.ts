import type { ILogger } from '#domain/logging';
import type { NpmSuggestionProvider } from '#domain/providers/npm';
import { type PnpmConfig, PnpmSuggestionProvider } from '#domain/providers/pnpm';
import { test } from 'mocha-ui-esm';
import assert from 'node:assert';
import { instance, mock, when } from 'ts-mockito';
import Fixtures from './pnpmSuggestionProvider.fixtures';

type TestContext = {
  configMock: PnpmConfig
  npmProviderMock: NpmSuggestionProvider
  loggerMock: ILogger
}

export const PnpmSuggestionProviderTests = {

  [test.title]: PnpmSuggestionProvider.name,

  beforeEach: async function (this: TestContext) {
    this.configMock = mock<PnpmConfig>();
    this.npmProviderMock = mock<NpmSuggestionProvider>();
    this.loggerMock = mock<ILogger>();
  },

  parseDependencies: {
    "case $i: matches pnpm-workspace.yaml": function (this: TestContext) {
      const testDepProps = [
        'catalog',
        'catalogs.*.*'
      ];
      const put = new PnpmSuggestionProvider(
        instance(this.configMock),
        instance(this.npmProviderMock),
        instance(this.loggerMock)
      );
      when(this.configMock.dependencyProperties).thenReturn(testDepProps);
      // test
      const results = put.parseDependencies(
        'test/path/pnpm-workspace.yaml',
        Fixtures.parseDependencies.yaml.test
      );
      // assert
      assert.deepEqual(results, Fixtures.parseDependencies.yaml.expected);
    },
  }
}