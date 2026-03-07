import {
  TomlParserOptions,
  getTomlComplexTypeHandlers,
  parsePackagesToml
} from '#domain/parsers';
import { test } from 'mocha-ui-esm';
import assert from 'node:assert';
import Fixtures from './pipfileParser.fixtures';

export const pipfileParserTests = {

  [test.title]: 'PipfileParser',

  "case $i: parses pypi pipfile dependencies": [
    Fixtures.parsesPipfilePackages,
    Fixtures.parsesPipfileDevPackages,
    Fixtures.parsesPipfileProject,
    (fixture: any) => {
      const testOptions: TomlParserOptions = {
        includePropNames: [
          'project',
          'packages',
          'dev-packages',
        ],
        complexTypeHandlers: getTomlComplexTypeHandlers()
      };

      const actual = parsePackagesToml(fixture.test, testOptions);
      assert.deepEqual(actual, fixture.expected);
    }
  ]

}
