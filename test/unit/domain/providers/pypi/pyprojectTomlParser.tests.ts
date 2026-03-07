import {
  TomlParserOptions,
  getTomlComplexTypeHandlers,
  parsePackagesToml
} from '#domain/parsers';
import { test } from 'mocha-ui-esm';
import assert from 'node:assert';
import Fixtures from './pyprojectTomlParser.fixtures';

export const pyprojectTomlParserTests = {

  [test.title]: 'PyprojectTomlParser',

  "case $i: parses pypi pyproject dependencies": [
    Fixtures.parsesPyprojectProjectDependencies,
    Fixtures.parsesPyprojectProjectDependenciesNoVersion,
    Fixtures.parsesPyprojectOptionalDependencies,
    Fixtures.parsesPoetryDependencies,
    (fixture: any) => {
      const testOptions: TomlParserOptions = {
        includePropNames: [
          'project',
          'project.dependencies',
          'project.optional-dependencies',
          'tool.poetry.dependencies',
          'tool.poetry.group.*.dependencies',
        ],
        complexTypeHandlers: getTomlComplexTypeHandlers()
      };

      const actual = parsePackagesToml(fixture.test, testOptions);
      assert.deepEqual(actual, fixture.expected);
    }
  ]

}
