import {
  PackageDescriptor,
  TPackageVersionDescriptor,
  createIgnoreChangesDesc,
  createNameDescFromJsonNode,
  createPackageVersionDesc,
  createParentDesc
} from "domain/packages";
import * as JsonC from 'jsonc-parser';

/**
 * A regex to match the `package.json`'s `packageManager` value.
 *
 * @example packageManager@version
 */
export const packageManagerVersionRegex = /^([\w]+)@(.+)$/;

export function createPackageManagerDesc(path: string, node: JsonC.Node): PackageDescriptor {
  const nameDesc = createNameDescFromJsonNode(node);
  const versionDesc = createPackageManagerVersionFromJsonNode(node);
  const parentDesc = createParentDesc(path);
  const ignoreChangesDesc = createIgnoreChangesDesc();

  const packageDesc = new PackageDescriptor([
    nameDesc,
    versionDesc,
    parentDesc,
    ignoreChangesDesc
  ]);

  return packageDesc;
}

function createPackageManagerVersionFromJsonNode(valueNode: any): TPackageVersionDescriptor {
  // +1 and -1 to be inside quotes
  const versionRange = {
    start: valueNode.offset + 1,
    end: valueNode.offset + valueNode.length - 1,
  };

  let { value: version } = valueNode;

  // Handle packageManager field
  const [_, packageName, packageVersion] =
    packageManagerVersionRegex.exec(valueNode.value) ?? [];

  if (packageVersion != null) {
    version = packageVersion;
    versionRange.start += packageName.length + 1;
  }

  return createPackageVersionDesc(version, versionRange);
}