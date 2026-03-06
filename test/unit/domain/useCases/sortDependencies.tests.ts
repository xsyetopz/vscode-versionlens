import { SortDependencies } from '#domain/useCases';
import { PubSuggestionProvider } from '#domain/providers/pub';
import { test } from 'mocha-ui-esm';
import { deepEqual, equal, ok } from 'node:assert';
import { mock, instance, when } from 'ts-mockito';
import type { PubConfig, PubSuggestionResolver } from '#domain/providers/pub';
import type { ILogger } from '#domain/logging';
import fixtures from './sortDependencies.fixtures';

export const sortDependenciesTests = {

  [test.title]: SortDependencies.name,

  "returns empty when no dependencies provided": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, dependencies, expected } = fixtures.returnsEmptyWhenNoDependenciesProvided;

    // test
    const actual = cut.execute(packageText, dependencies);

    // assert
    deepEqual(actual, expected);
  },

  "sorts single group of dependencies alphabetically": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, dependencies } = fixtures.sortsSingleGroupOfDependenciesAlphabetically;

    // test
    const actual = cut.execute(packageText, dependencies);

    // assert
    equal(actual.length, 2);
    equal(actual[0].newText, '"apple": "2.0.0"');
    equal(actual[1].newText, '"zebra": "1.0.0"');
  },

  "sorts multiple groups independently": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, dependencies } = fixtures.sortsMultipleGroupsIndependently;

    // test
    const actual = cut.execute(packageText, dependencies);

    // assert
    equal(actual.length, 4);
    // group 1
    equal(actual[0].newText, '"apple": "2.0.0"');
    equal(actual[1].newText, '"zebra": "1.0.0"');
    // group 2
    equal(actual[2].newText, '"ant": "2.0.0"');
    equal(actual[3].newText, '"yarn": "1.0.0"');
  },

  "doesn't generate edits if already sorted": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, dependencies, expected } = fixtures.doesntGenerateEditsIfAlreadySorted;

    // test
    const actual = cut.execute(packageText, dependencies);

    // assert
    deepEqual(actual, expected);
  },

  "preserves all entries after requirements.txt sort": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, dependencies, expectedSorted } = fixtures.preservesAllEntriesAfterRequirementsTxtSort;

    // test
    const edits = cut.execute(packageText, dependencies);

    // apply edits
    let result = packageText;
    const sortedEdits = [...edits].sort((a, b) => b.range.start - a.range.start);
    for (const edit of sortedEdits) {
      result = result.slice(0, edit.range.start) + edit.newText + result.slice(edit.range.end);
    }

    // assert that no entries are lost
    for (const dep of dependencies) {
      ok(result.includes(dep.package.name), `${dep.package.name} should be present in the result`);
    }

    // assert specific problematic entry and its comment
    ok(result.includes('numpy'), 'numpy should be present in the result');
    ok(result.includes('# this should not cause issues'), 'numpy comment should be preserved');

    const resultLines = result.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));

    equal(resultLines.length, expectedSorted.length, "should have same number of packages");
    for (let i = 0; i < expectedSorted.length; i++) {
      equal(resultLines[i], expectedSorted[i], `Line ${i} should be ${expectedSorted[i]}`);
    }
  },

  "sorts complex yaml dependencies correctly": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, expectedSorted } = fixtures.sortsComplexYamlDependenciesCorrectly;

    const resolverMock = mock<PubSuggestionResolver>();
    const configMock = mock<PubConfig>();
    const loggerMock = mock<ILogger>();
    when(configMock.dependencyProperties).thenReturn(['dependencies']);

    const provider = new PubSuggestionProvider(
      instance(resolverMock),
      instance(configMock),
      instance(loggerMock)
    );

    const dependencies = provider.parseDependencies('pubspec.yaml', packageText);

    // test
    const edits = cut.execute(packageText, dependencies);

    // apply edits
    let result = packageText;
    const sortedEdits = [...edits].sort((a, b) => b.range.start - a.range.start);
    for (const edit of sortedEdits) {
      result = result.slice(0, edit.range.start) + edit.newText + result.slice(edit.range.end);
    }

    equal(result, expectedSorted);
  },

  "sorts yaml dependencies with comments correctly": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, expectedSorted } = fixtures.sortsYamlDependenciesWithCommentsCorrectly;

    const resolverMock = mock<PubSuggestionResolver>();
    const configMock = mock<PubConfig>();
    const loggerMock = mock<ILogger>();
    when(configMock.dependencyProperties).thenReturn(['dependencies']);

    const provider = new PubSuggestionProvider(
      instance(resolverMock),
      instance(configMock),
      instance(loggerMock)
    );

    const dependencies = provider.parseDependencies('pubspec.yaml', packageText);

    // test
    const edits = cut.execute(packageText, dependencies);

    // apply edits
    let result = packageText;
    const sortedEdits = [...edits].sort((a, b) => b.range.start - a.range.start);
    for (const edit of sortedEdits) {
      result = result.slice(0, edit.range.start) + edit.newText + result.slice(edit.range.end);
    }

    equal(result, expectedSorted);
  }

};
