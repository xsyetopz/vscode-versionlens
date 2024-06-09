import * as JsonC from 'jsonc-parser';
import { createPackageManagerDesc } from './npmPackageTypeFactory';

export function customDescriptorHandler(path: string, node: JsonC.Node) {
  if (node.type !== 'string') return;

  const parent = node.parent.children[0];
  if (parent.value === 'packageManager') {
    return createPackageManagerDesc(path, node);
  }
}