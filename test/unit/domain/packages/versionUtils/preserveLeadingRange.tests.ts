import { VersionUtils } from '#domain/packages';
import { test } from '@esm-test/esm-test-node';
import assert from 'node:assert';

export const preserveLeadingRangeTests = {

  [test.title]: VersionUtils.preserveLeadingRange.name,

  "case $i: preserves leading range symbols": [
    { existingVersion: '^1.2.3', newVersion: '2.0.0', expected: '^2.0.0' },
    { existingVersion: '~1.2.3', newVersion: '2.0.0', expected: '~2.0.0' },
    { existingVersion: '>=1.2.3', newVersion: '2.0.0', expected: '>=2.0.0' },
    { existingVersion: '<=1.2.3', newVersion: '2.0.0', expected: '<=2.0.0' },
    { existingVersion: '>1.2.3', newVersion: '2.0.0', expected: '>2.0.0' },
    { existingVersion: '<1.2.3', newVersion: '2.0.0', expected: '<2.0.0' },
    { existingVersion: '==1.2.3', newVersion: '2.0.0', expected: '==2.0.0' },
    { existingVersion: '~>1.2.3', newVersion: '2.0.0', expected: '~>2.0.0' },
    { existingVersion: '1.2.3', newVersion: '2.0.0', expected: '2.0.0' },
    { existingVersion: 'v1.2.3', newVersion: '2.0.0', expected: '2.0.0' },
    (fixture: any) => {
      const { existingVersion, newVersion, expected } = fixture;
      const actual = VersionUtils.preserveLeadingRange(existingVersion, newVersion);
      assert.equal(actual, expected);
    }
  ]

}
