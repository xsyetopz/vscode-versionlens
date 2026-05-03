import {
  type PackageNameDescriptor,
  type PackagePathDescriptor,
  type PackageTypeDescriptor,
  PackageDescriptor,
  PackageDescriptorType,
  createPackageVersionDesc
} from '#domain/parsers';
import { test } from '@esm-test/esm-test-node';
import assert from 'node:assert';

const testNameDesc: PackageNameDescriptor = {
  type: PackageDescriptorType.name,
  name: "testName",
  nameRange: { start: 1, end: 1 }
};

const testVersionDesc = createPackageVersionDesc(
  "1.0.0",
  { start: 2, end: 2 }
);

const testPathDesc: PackagePathDescriptor = {
  type: "path",
  path: "test/path",
  pathRange: { start: 100, end: 111 }
}

export const PackageDescriptorTests = {

  [test.title]: PackageDescriptor.name,

  addType: {

    "can add $1 types": [
      ["single", [testVersionDesc]],
      ["multiple", [testNameDesc, testVersionDesc, testPathDesc]],
      (testTitle: string, testDescriptors: Array<PackageTypeDescriptor>) => {
        // setup
        const testPackageDesc = new PackageDescriptor([]);

        // test
        testDescriptors.forEach(x => testPackageDesc.addType(x));

        // assert
        assert.equal(testPackageDesc.typeCount, testDescriptors.length);

        testDescriptors.forEach(
          x => assert.deepEqual(testPackageDesc.getType(x.type), x)
        );
      }
    ]

  },

  hasType: {

    "returns true for $1 types": [
      ["single", [testVersionDesc]],
      ["multiple", [testNameDesc, testVersionDesc, testPathDesc]],
      (testTitle: string, testDescriptors: Array<PackageTypeDescriptor>) => {
        // setup
        const testPackageDesc = new PackageDescriptor([]);

        // test
        testDescriptors.forEach(x => testPackageDesc.addType(x));

        // assert
        testDescriptors.forEach(
          x => assert.ok(testPackageDesc.hasType(x.type))
        );
      }
    ]

  }

}