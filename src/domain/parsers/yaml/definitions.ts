import { PackageTypeDescriptor } from '#domain/parsers';
import { KeyDictionary } from '#domain/utils';

export type YamlParserOptions = {
  includePropNames: Array<string>,
  complexTypeHandlers: KeyDictionary<YamlTypeDescriptorHandler>;
}

export type YamlTypeDescriptorHandler = (
  valueNode: any,
  isQuoteType: boolean
) => PackageTypeDescriptor | undefined;
