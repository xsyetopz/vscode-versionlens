import { TYamlPackageTypeHandler } from '#domain/parsers';
import { KeyDictionary } from '#domain/utils';

export type TYamlPackageParserOptions = {
  includePropNames: Array<string>,
  complexTypeHandlers: KeyDictionary<TYamlPackageTypeHandler>;
}