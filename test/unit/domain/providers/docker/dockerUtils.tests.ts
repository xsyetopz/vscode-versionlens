import { createDigestMapper, createVersionMapper, extract, findSimilarBuild } from '#domain/providers/docker';
import { deepEqual, equal, notEqual } from 'assert';
import fixtures from './dockerUtils.fixtures';

export const dockerUtilsTests = {

  title: 'DockerUtils',

  [createDigestMapper.name]: {
    "returns empty maps when no tag results": () => {
      // test
      const actual = createDigestMapper([])
      // assert
      notEqual(actual, undefined)
      deepEqual(actual.tagMap, {})
      deepEqual(actual.digestMap, {})
    },
    "returns tags and digest maps": () => {
      // test
      const actual = createDigestMapper(fixtures.test)
      // assert
      deepEqual(actual.digestMap, fixtures.expected.digestMapper.digestMap)
      deepEqual(actual.tagMap, fixtures.expected.digestMapper.tagMap)
    }
  },

  [createVersionMapper.name]: {
    "returns empty maps when no tag results": () => {
      // test
      const actual = createVersionMapper([])
      // assert
      notEqual(actual, undefined)
      deepEqual(actual.versionMap, {})
      deepEqual(actual.tagMap, {})
    },
    "returns tags and version maps": () => {
      // test
      const actual = createVersionMapper(fixtures.test)
      // assert
      deepEqual(actual.versionMap, fixtures.expected.versionMapper.versionMap)
      deepEqual(actual.tagMap, fixtures.expected.versionMapper.tagMap)
      deepEqual(actual.releases, fixtures.expected.versionMapper.releases)
      equal(actual.latest, fixtures.expected.versionMapper.latest)
    }
  },

  [extract.name]: {
    "returns empty when a tag is '$1'": [
      undefined,
      null,
      '',
      (testTag: string) => {
        // test
        const actual = extract(testTag)
        // assert
        notEqual(actual, undefined)
        equal(actual.version, '')
        equal(actual.tag, '')
      }
    ],
    "case $i: extracts versions": [
      ['tag1', ''],
      ['tag1-tag2', ''],
      ['1.2.3', '1.2.3'],
      ['1.2.3-tag1-tag2', '1.2.3'],
      ['1', '1.*.*'],
      ['1-tag1-tag2', '1.*.*'],
      ['1.2', '1.2.*'],
      ['1.2-tag1-tag2', '1.2.*'],
      // ['1.2.3-dev.1', '1.2.3-dev.1'],
      (testTag: string, expected: string) => {
        // test
        const actual = extract(testTag)
        // assert
        equal(actual.version, expected)
      }
    ],
    "case $i: extracts tags": [
      ['1.2.3', ''],
      ['1.2.3-tag1', 'tag1'],
      ['1.2.3-tag1-tag2', 'tag1-tag2'],
      ['tag1', 'tag1'],
      ['tag1-tag2', 'tag1-tag2'],
      ['1.2.3-alpine3.21', 'alpine3.21'],
      (testTag: string, expected: string) => {
        // test
        const actual = extract(testTag)
        // assert
        equal(actual.tag, expected)
      }
    ]
  },

  [findSimilarBuild.name]: {
    "returns null when no version provided": () => {
      const actual = findSimilarBuild('', ['1.2.3-xyz', '2.2.3-aba'])
      equal(actual, null)
    },
    "returns null when no builds are provided": () => {
      const actual = findSimilarBuild('1.2.3-abc', [])
      equal(actual, null)
    },
    "returns null when no match found": () => {
      const actual = findSimilarBuild('1.2.3-abc', ['1.2.3-xyz', '2.2.3-aba'])
      equal(actual, null)
    },
    "case $i: returns similar build version": [
      ['1.2.3-abc', '2.0.0-abc'],
      ['20.19.1-bookworm', '23.11.0-bookworm'],
      (testVersion: string, expected: string) => {
        const actual = findSimilarBuild(testVersion, ['2.0.0-abc', '3.0.0-aba', '23.11.0-bookworm'])
        equal(actual, expected)
      }
    ]
  }

}