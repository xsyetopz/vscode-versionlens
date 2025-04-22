import type { XmlNode } from '#domain/parsers';
import {
  type PackageNameDescriptor,
  type PackageVersionDescriptor,
  PackageDescriptor,
  createPackageNameDesc,
  createPackageVersionDesc,
  createProjectVersionTypeDesc
} from '#domain/parsers';

export function createNameDescFromXmlElem(keyNode: XmlNode): PackageNameDescriptor {
  const nameRange = {
    start: keyNode.tagOpenStart,
    end: keyNode.tagOpenStart
  };

  return createPackageNameDesc(keyNode.name, nameRange);
}

export function createVersionDescFromXmlElem(keyNode: XmlNode): PackageVersionDescriptor {
  const versionText = keyNode.text ?? '';
  const versionRange = {
    start: keyNode.tagOpenEnd,
    end: keyNode.tagCloseStart
  };
  return createPackageVersionDesc(versionText, versionRange);
}

export function createProjectVersionDescFromXmlElem(node: XmlNode): PackageDescriptor {
  const nameDesc = createNameDescFromXmlElem(node);
  const versionDesc = createVersionDescFromXmlElem(node);
  const projectVersionDesc = createProjectVersionTypeDesc();
  return new PackageDescriptor([
    nameDesc,
    versionDesc,
    projectVersionDesc
  ]);
}