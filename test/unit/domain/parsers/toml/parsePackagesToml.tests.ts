import {
  TomlParserOptions,
  getTomlComplexTypeHandlers,
  parsePackagesToml
} from '#domain/parsers';
import { test } from 'mocha-ui-esm';
import assert from 'node:assert';
import Fixtures from './parsePackagesToml.fixtures';

export const extractPackageDependenciesFromTomlTests = {

  [test.title]: parsePackagesToml.name,

  "returns empty when no dependency entry names match": () => {
    const includePropNames = ["non-dependencies"];

    const testOptions: TomlParserOptions = {
      includePropNames,
      complexTypeHandlers: getTomlComplexTypeHandlers()
    };

    const results = parsePackagesToml(
      Fixtures.parsesDependencyEntries.test,
      testOptions
    );

    assert.equal(results.length, 0);
  },

  "case $i: parses dependencies from toml": [
    Fixtures.parsesDependencyEntries,
    Fixtures.parsesPackageVersionEntries,
    Fixtures.parsesProjectVersionEntries,
    Fixtures.parsesPackageDependenciesEntries,
    Fixtures.parsesPackageOptionalDependenciesEntries,
    (fixture: any) => {
      const testOptions: TomlParserOptions = {
        includePropNames: [
          'project',
          'package',
          'dependencies',
          'dependencies.*',
          'dev-dependencies',
          'tool.poetry.group.*.dependencies',
          'project.optional-dependencies',
        ],
        complexTypeHandlers: getTomlComplexTypeHandlers()
      };

      const actual = parsePackagesToml(fixture.test, testOptions);
      assert.deepEqual(actual, fixture.expected);
    }
  ]

}