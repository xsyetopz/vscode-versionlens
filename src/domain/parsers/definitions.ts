export enum PackageDescriptorType {
  name = "name",
  version = "version",
  path = "path",
  git = "git",
  hosted = "hosted",
  parent = "parent",
  ignoreChanges = "ignoreChanges",
  projectVersion = "projectVersion",
  image = "image",
  build = 'build'
}

export type TPackageTextRange = {
  start: number;
  end: number;
};

export type TPackageType = {
  type: keyof typeof PackageDescriptorType
}

export type TPackageNameDescriptor = TPackageType & {
  name: string
  nameRange: TPackageTextRange
}

export type TPackageVersionDescriptor = TPackageType & {
  version: string
  versionRange: TPackageTextRange
  versionPrepend: string
  versionAppend: string
}

export type TPackagePathDescriptor = TPackageType & {
  path: string
  pathRange: TPackageTextRange
}

export type TPackageHostedDescriptor = TPackageType & {
  hostPackageName: string
  hostUrl: string
}

export type TPackageGitDescriptor = TPackageType & {
  gitUrl: string
  gitRef?: string
  gitPath?: string
}

export type TPackageParentDescriptor = TPackageType & {
  path: string
}

export type TPackageIgnoreChangesDescriptor = TPackageType & {}

export type TPackageProjectVersionDescriptor = TPackageType & {}

export type TPackageImageDescriptor = TPackageType & {
  nameDesc: TPackageNameDescriptor
  versionDesc: TPackageVersionDescriptor
}

export type TPackageBuildDescriptor = TPackageType & {
  pathDesc: TPackagePathDescriptor
}

export type TPackageTypeDescriptor = TPackageNameDescriptor
  | TPackageVersionDescriptor
  | TPackagePathDescriptor
  | TPackageHostedDescriptor
  | TPackageGitDescriptor
  | TPackageParentDescriptor
  | TPackageIgnoreChangesDescriptor
  | TPackageProjectVersionDescriptor
  | TPackageImageDescriptor
  | TPackageBuildDescriptor