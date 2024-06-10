import {
  createGitDescFromYamlNode,
  createHostedDescFromYamlNode,
  createPathDescFromYamlNode,
  createVersionDescFromYamlNode,
  parsePackagesYaml,
  TYamlPackageParserOptions,
  TYamlPackageTypeHandler
} from 'domain/packages';
import { KeyDictionary } from 'domain/utils';
import { test } from 'mocha-ui-esm';
import assert from 'node:assert';
import Fixtures from './extractPackageDependenciesFromYaml.fixtures';

const complexTypeHandlers = <KeyDictionary<TYamlPackageTypeHandler>>{
  "version": createVersionDescFromYamlNode,
  "path": createPathDescFromYamlNode,
  "hosted": createHostedDescFromYamlNode,
  "git": createGitDescFromYamlNode
}

export const extractPackageDependenciesFromYamlTests = {

  [test.title]: parsePackagesYaml.name,

  "returns empty when no matches found": () => {
    const includePropNames: Array<string> = [];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      "",
      testOptions
    );
    assert.equal(results.length, 0);
  },

  "returns empty when no dependency entry names match": () => {
    const includePropNames = ["non-dependencies"];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      Fixtures.parsesDependencyEntries.test,
      testOptions
    );

    assert.equal(results.length, 0);
  },

  "parses general dependencies from yaml": () => {
    const includePropNames = ["dependencies"];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      Fixtures.parsesDependencyEntries.test,
      testOptions
    );

    assert.deepEqual(results, Fixtures.parsesDependencyEntries.expected);
  },

  "parses path type dependencies from yaml": () => {
    const includePropNames = ["dependencies"];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      Fixtures.parsesPathDependencies.test,
      testOptions
    );

    assert.deepEqual(results, Fixtures.parsesPathDependencies.expected);
  },

  "parses git type dependencies from yaml": () => {
    const includePropNames = ["dependencies"];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      Fixtures.parsesGitDepencdencies.test,
      testOptions
    );
    assert.deepEqual(results, Fixtures.parsesGitDepencdencies.expected);
  },

  "parses hosted type dependencies from yaml": () => {
    const includePropNames = ["dependencies"];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      Fixtures.parsesHostedDependencies.test,
      testOptions
    );

    assert.deepEqual(results, Fixtures.parsesHostedDependencies.expected);
  }
}