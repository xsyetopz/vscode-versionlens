import { KeyDictionary } from '#domain/utils';
import { TYamlPackageTypeHandler } from '#infrastructure/parsers';

export type TYamlPackageParserOptions = {
  includePropNames: Array<string>,
  complexTypeHandlers: KeyDictionary<TYamlPackageTypeHandler>;
}