import {
  type JsonPackageTypeHandler,
  type JsonParserOptions,
  createPathDescFromJsonNode,
  createRepoDescFromJsonNode,
  createVersionDescFromJsonNode,
  parsePackagesJson
} from '#domain/parsers';
import type { KeyDictionary } from '#domain/utils';
import { test } from '@esm-test/esm-test-node';
import assert from 'node:assert';
import Fixtures from './parsePackagesJson.fixtures';

const complexTypeHandlers: KeyDictionary<JsonPackageTypeHandler> = {
  "version": createVersionDescFromJsonNode,
  "path": createPathDescFromJsonNode,
  "repository": createRepoDescFromJsonNode
};

export const extractPackageDependenciesFromJsonTests = {

  [test.title]: parsePackagesJson.name,

  "returns empty when no matches found": () => {
    const includePropNames: Array<string> = []

    const testOptions: JsonParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesJson(
      "",
      testOptions
    );
    assert.equal(results.length, 0);
  },

  "returns empty when no dependency entry names match": () => {
    const includePropNames = ["non-dependencies"];

    const testOptions: JsonParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesJson(
      JSON.stringify(Fixtures.parsesDependencyEntries.test),
      testOptions
    );

    assert.equal(results.length, 0);
  },

  "parses dependency entries from json": () => {
    const includePropNames = ["dependencies"];

    const testOptions: JsonParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesJson(
      JSON.stringify(Fixtures.parsesDependencyEntries.test),
      testOptions
    );

    assert.deepEqual(results, Fixtures.parsesDependencyEntries.expected);
  },

  "matches json expression paths": () => {
    const includePropNames = ["overrides.*"];

    const testOptions: JsonParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesJson(
      JSON.stringify(Fixtures.matchesPathExpressions.test),
      testOptions
    );

    assert.deepEqual(results, Fixtures.matchesPathExpressions.expected);
  },
  
};
