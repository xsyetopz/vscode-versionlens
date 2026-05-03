import { parseRequirementsTxt } from '#domain/providers/pypi';
import { test } from '@esm-test/esm-test-node';
import { deepEqual, equal } from 'node:assert';
import Fixtures from './requirementsParser.fixtures';

export const RequirementsParserTests = {

  [test.title]: 'RequirementsParser',

  parseRequirementsTxt: {

    "returns empty when no matches found": () => {
      // setup
      const text = "";

      // test
      const results = parseRequirementsTxt(
        "test.txt",
        text
      );

      // assert
      equal(results.length, 0);
    },

    "case $i: parses dependencies from requirements.txt": [
      Fixtures.parsesRequirementsTxt,
      (fixture: any) => {
        // setup
        const { test, expected } = fixture;

        // test
        const actual = parseRequirementsTxt("test.txt", test);

        // assert
        deepEqual(actual, expected);
      }
    ]

  }

}
