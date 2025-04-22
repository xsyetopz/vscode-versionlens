import type { PackageDescriptorType, PackageTypeDescriptor } from "#domain/parsers";
import type { KeyDictionary } from '#domain/utils';

export class PackageDescriptor {

  constructor(descriptors: PackageTypeDescriptor[]) {
    this.types = descriptors.length > 0
      ? Object.assign({}, ...descriptors.map(x => ({ [x.type]: x })))
      : {};

    this.typeCount = descriptors.length;
  }

  types: KeyDictionary<PackageTypeDescriptor>;

  typeCount: number;

  addType(desc: PackageTypeDescriptor) {
    this.types[desc.type] = desc;
    this.typeCount++;
  }

  hasType(descType: keyof typeof PackageDescriptorType): boolean {
    return Reflect.has(this.types, descType);
  }

  getType<T extends PackageTypeDescriptor>(descType: keyof typeof PackageDescriptorType): T {
    return this.types[descType] as T;
  }

}