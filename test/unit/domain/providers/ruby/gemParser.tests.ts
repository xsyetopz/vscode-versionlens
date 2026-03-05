import { parseGemfile } from '#domain/providers/ruby';
import { test } from 'mocha-ui-esm';
import { deepEqual, equal } from 'node:assert';
import Fixtures from './gemParser.fixtures';

export const GemParserTests = {

  [test.title]: 'GemParser',

  parseGemfile: {

    "returns empty when no matches found": () => {
      // setup
      const text = "";

      // test
      const results = parseGemfile(
        "Gemfile",
        text
      );

      // assert
      equal(results.length, 0);
    },

    "case $i: parses dependencies from Gemfile": [
      Fixtures.general,
      Fixtures.path,
      Fixtures.git,
      Fixtures.github,
      Fixtures.gitRefs,
      Fixtures.withComments,
      (fixture: any) => {
        // setup
        const { test, expected } = fixture;

        // test
        const actual = parseGemfile("Gemfile", test);

        // assert
        deepEqual(actual, expected);
      }
    ]

  }

}
