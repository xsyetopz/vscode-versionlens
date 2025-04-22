import type { PackageTypeDescriptor } from '#domain/parsers';
import type { KeyDictionary } from '#domain/utils';
import { AST } from 'toml-eslint-parser';

export type TomlPackageTypeHandler = (node: AST.TOMLValue) => PackageTypeDescriptor;

export type TomlParserOptions = {
  includePropNames: Array<string>,
  complexTypeHandlers: KeyDictionary<TomlPackageTypeHandler>
}