import { SuggestionUpdate } from '#domain/packages';
import { npmReplaceVersion } from '#domain/providers/npm';
import { test } from '@esm-test/esm-test-node';
import assert from 'node:assert';
import Fixtures from './npmReplaceVersion.fixtures';

export const npmReplaceVersionTests = {

  [test.title]: 'npmReplaceVersion',

  "case $i: correctly replaces versions": [
    ...Fixtures.npmReplaceVersion,
    (fixture: any) => {
      // setup
      const { suggestion, expected } = fixture;

      // test
      const actual = npmReplaceVersion(suggestion as SuggestionUpdate);

      // assert
      assert.equal(actual, expected);
    }
  ]

}
