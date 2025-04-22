import type { PackageDescriptor, PackageTypeDescriptor } from '#domain/parsers';
import type { KeyDictionary } from '#domain/utils';
import * as JsonC from 'jsonc-parser';

export type JsonParserCustomHandler = (path: string, valueNode: JsonC.Node) => PackageDescriptor | undefined;

export type JsonPackageTypeHandler = (valueNode: JsonC.Node) => PackageTypeDescriptor;

export type JsonParserOptions = {
  includePropNames: Array<string>,
  customDescriptorHandler?: JsonParserCustomHandler,
  complexTypeHandlers: KeyDictionary<JsonPackageTypeHandler>
}

export type FoundNode = {
  path: string,
  node: JsonC.Node | Array<JsonC.Node>
}