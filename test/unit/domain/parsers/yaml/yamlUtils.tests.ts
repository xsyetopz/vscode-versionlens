import { findByPath } from '#domain/parsers';
import { deepEqual, equal } from 'node:assert';
import { parseDocument } from 'yaml';
import fixtures from './yamlUtils.fixtures';

export const yamlUtilTests = {

  title: 'Tests',

  findByPath: {
    "returns an empty array when": {
      "yaml is empty": () => {
        const rootNode = parseDocument('')
        const pathSegments = '1.2.*'.split(".");
        const actual = findByPath(rootNode, pathSegments)
        equal(actual.length, 0)
      },
      "case $i: path doesn't match": [
        '',
        '*',
        '1.2.*',
        (testPath: string) => {
          const testYaml = `
            1-1:
              2-1: test1
            1-2:
              2-2: test2
          `
          const rootNode = parseDocument(testYaml)
          const pathSegments = testPath.split(".");
          const actual = findByPath(rootNode, pathSegments)
          equal(actual.length, 0)
        }
      ]
    },
    "case $i: finds paths in complex yaml": [
      ['1-1.2-1.3-1', fixtures.complex.test, fixtures.complex.expected1],
      ['1-1.2-1.*', fixtures.complex.test, fixtures.complex.expected2],
      ['1-1.*.*', fixtures.complex.test, fixtures.complex.expected3],
      function (testPath: string, testYaml: string, expected: any[]) {
        const rootNode = parseDocument(testYaml)
        const pathSegments = testPath.split(".");
        const actual = findByPath(rootNode, pathSegments)
        const mapped = actual.map(x => JSON.parse(JSON.stringify(x, null, '')))

        equal(mapped.length, expected.length)
        deepEqual(mapped, expected)
      }
    ]
  }

}