import type { ILogger } from '#domain/logging';
import { type PubSuggestionResolver, type PubConfig, PubSuggestionProvider } from '#domain/providers/pub';
import { test } from 'mocha-ui-esm';
import { deepEqual, equal } from 'node:assert';
import { instance, mock, when } from 'ts-mockito';
import Fixtures from './pubSuggestionProvider.fixtures';

type TestContext = {
  resolverMock: PubSuggestionResolver
  configMock: PubConfig
  put: PubSuggestionProvider
  loggerMock: ILogger
}

export const pubSuggestionProviderTests = {

  [test.title]: PubSuggestionProvider.name,

  beforeEach: function (this: TestContext) {
    this.resolverMock = mock<PubSuggestionResolver>()
    this.configMock = mock<PubConfig>()
    this.loggerMock = mock<ILogger>()
    this.put = new PubSuggestionProvider(
      instance(this.resolverMock),
      instance(this.configMock),
      instance(this.loggerMock)
    );
  },

  "returns empty when no matches found": function (this: TestContext) {
    // test
    const actual = this.put.parseDependencies('test/path', '')
    // assert
    equal(actual.length, 0);
  },

  "returns empty when no dependency entry names match": function (this: TestContext) {
    const includePropNames = ['non-dependencies'];
    when(this.configMock.dependencyProperties).thenReturn(includePropNames);
    // test
    const results = this.put.parseDependencies('test/path', Fixtures.parsesDependencyEntries.test);
    // assert
    equal(results.length, 0);
  },

  "ignores arrays": function (this: TestContext) {
    const testProps = ['fonts'];
    const testContent = `
      fonts:
        - family: SST Arabic
          fonts:
            - asset: assets/fonts/SST-Arabic-Medium.ttf
    `;
    when(this.configMock.dependencyProperties).thenReturn(testProps);
    // test
    const actual = this.put.parseDependencies('test/path', testContent)
    // assert
    equal(actual.length, 0);
  },

  "case $i: parses yaml dependencies": [
    Fixtures.parsesDependencyEntries,
    Fixtures.parsesPathDependencies,
    Fixtures.parsesGitDepencdencies,
    Fixtures.parsesHostedDependencies,
    Fixtures.parsesProjectVersionNoQuotes,
    Fixtures.parsesProjectVersionWithQuotes,
    Fixtures.parsesProjectVersionWithComment,
    Fixtures.parsesEmptyProjectVersionWithComment,
    Fixtures.parsesAnyVersionKeyword,
    function (this: TestContext, fixture: any) {
      const includePropNames = ['version', 'dependencies'];
      when(this.configMock.dependencyProperties).thenReturn(includePropNames);
      // test
      const results = this.put.parseDependencies('test/path', fixture.test);
      // assert
      deepEqual(results, fixture.expected);
    }
  ]
}