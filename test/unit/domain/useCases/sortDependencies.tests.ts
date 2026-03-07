import type { ILogger } from '#domain/logging';
import { PackageDependency, createPackageManifest } from '#domain/packages';
import {
  PackageNameDescriptor,
  PackageVersionDescriptor,
  createVersionDescFromJsonNode,
  parsePackagesJson
} from '#domain/parsers';
import type { PubConfig, PubSuggestionResolver } from '#domain/providers/pub';
import { PubSuggestionProvider } from '#domain/providers/pub';
import { parseRequirementsTxt } from '#domain/providers/pypi';
import { SortDependencies, type TextEdit } from '#domain/useCases';
import { test } from 'mocha-ui-esm';
import { deepEqual, equal } from 'node:assert';
import { instance, mock, when } from 'ts-mockito';
import fixtures from './sortDependencies.fixtures';

export const sortDependenciesTests = {

  [test.title]: SortDependencies.name,

  "returns empty when no dependencies provided": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, expected } = fixtures.returnsEmptyWhenNoDependenciesProvided;

    // test
    const actual = cut.execute(packageText, []);

    // assert
    deepEqual(actual, expected);
  },

  "sorts single group of dependencies alphabetically": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, expected } = fixtures.sortsSingleGroupOfDependenciesAlphabetically;
    const dependencies = parseJson(packageText);

    // test
    const edits = cut.execute(packageText, dependencies);

    // assert
    const actual = applyEdits(packageText, edits);
    equal(actual, expected);
  },

  "sorts multiple groups independently": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, expected } = fixtures.sortsMultipleGroupsIndependently;
    const dependencies = parseJson(packageText);

    // test
    const edits = cut.execute(packageText, dependencies);

    // assert
    const actual = applyEdits(packageText, edits);
    equal(actual, expected);
  },

  "doesn't generate edits if already sorted": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, expected } = fixtures.doesntGenerateEditsIfAlreadySorted;
    const dependencies = parseJson(packageText);

    // test
    const actual = cut.execute(packageText, dependencies);

    // assert
    deepEqual(actual, expected);
  },

  "preserves all entries after requirements.txt sort": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, expectedSorted } = fixtures.preservesAllEntriesAfterRequirementsTxtSort;
    const dependencies = parseRequirementsTxt('requirements.txt', packageText);

    // test
    const edits = cut.execute(packageText, dependencies);

    // assert
    const actual = applyEdits(packageText, edits);
    const actualLines = actual.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
    const expectedLines = expectedSorted.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));

    equal(actualLines.length, expectedLines.length, "should have same number of packages");
    for (let i = 0; i < expectedLines.length; i++) {
      equal(actualLines[i], expectedLines[i], `Line ${i} should be ${expectedLines[i]}`);
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

    // assert
    const actual = applyEdits(packageText, edits);
    equal(actual, expectedSorted);
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

    // assert
    const actual = applyEdits(packageText, edits);
    equal(actual, expectedSorted);
  },

  "sorts yaml dependencies with inline comments correctly": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, expectedSorted } = fixtures.sortsYamlDependenciesWithInlineCommentsCorrectly;

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

    // assert
    const actual = applyEdits(packageText, edits);
    equal(actual, expectedSorted);
  },

  "sorts yaml dependencies with mixed comments correctly": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, expectedSorted } = fixtures.sortsYamlDependenciesWithMixedCommentsCorrectly;

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

    // assert
    const actual = applyEdits(packageText, edits);
    equal(actual, expectedSorted);
  },

  "sorts yaml dependencies with no version and no space correctly": () => {
    // setup
    const cut = new SortDependencies();
    const { test: packageText, expectedSorted } = fixtures.sortsYamlDependenciesWithNoVersionAndNoSpaceCorrectly;

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

    // assert
    const actual = applyEdits(packageText, edits);
    equal(actual, expectedSorted);
  }

};

function parseJson(packageText: string): Array<PackageDependency> {
  const options = {
    includePropNames: ['dependencies', 'devDependencies'],
    complexTypeHandlers: {
      version: createVersionDescFromJsonNode
    }
  };
  const descriptors = parsePackagesJson(packageText, options as any);
  return descriptors.map(desc => {
    const nameDesc = desc.getType<PackageNameDescriptor>('name');
    const versionDesc = desc.getType<PackageVersionDescriptor>('version');
    return new PackageDependency(
      createPackageManifest(nameDesc!.name, versionDesc?.version || '', 'package.json'),
      desc
    );
  });
}

function applyEdits(text: string, edits: TextEdit[]): string {
  let result = text;
  const sortedEdits = [...edits].sort((a, b) => b.range.start - a.range.start);
  for (const edit of sortedEdits) {
    result = result.slice(0, edit.range.start) + edit.newText + result.slice(edit.range.end);
  }
  return result;
}
