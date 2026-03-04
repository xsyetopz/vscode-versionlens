import { createPackageManifest, PackageDependency } from '#domain/packages';
import {
  createPackageNameDesc,
  createPackageVersionDesc,
  createProjectVersionTypeDesc,
  createPackageGroupDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';

export default {
  test: `
    [package]
    version = "1.2.3"
    description = "test"
    edition = "2024"

    [dependencies]
    backtrace = { version = "0.3.69", optional = true }

    [dev-dependencies]
    rustversion = "1.0.14"

    [dev-dependencies.trybuild]
    version = "1.0.85"

    [workspace.dependencies]
    libc = "1.0.96"
  `,
  expected: <PackageDependency[]>[
    new PackageDependency(
      createPackageManifest('version', '1.2.3', 'test/path/Cargo.yaml'),
      new PackageDescriptor([
        createPackageNameDesc('version', createTextRange(19, 19)),
        createPackageVersionDesc('1.2.3', createTextRange(30, 35)),
        createProjectVersionTypeDesc()
      ])
    ),
    new PackageDependency(
      createPackageManifest('backtrace', '0.3.69', 'test/path/Cargo.yaml'),
      new PackageDescriptor([
        createPackageNameDesc('backtrace', createTextRange(107, 107)),
        createPackageVersionDesc('0.3.69', createTextRange(132, 138)),
        createPackageGroupDesc('dependencies', createTextRange(107, 158))
      ])
    ),
    new PackageDependency(
      createPackageManifest('rustversion', '1.0.14', 'test/path/Cargo.yaml'),
      new PackageDescriptor([
        createPackageNameDesc('rustversion', createTextRange(187, 187)),
        createPackageVersionDesc('1.0.14', createTextRange(202, 208)),
        createPackageGroupDesc('dev-dependencies', createTextRange(187, 209))
      ])
    ),
    new PackageDependency(
      createPackageManifest('trybuild', '1.0.85', 'test/path/Cargo.yaml'),
      new PackageDescriptor([
        createPackageNameDesc('trybuild', createTextRange(233, 233)),
        createPackageVersionDesc('1.0.85', createTextRange(258, 264)),
        createPackageGroupDesc('dev-dependencies.trybuild', createTextRange(247, 265))
      ])
    ),
    new PackageDependency(
      createPackageManifest('libc', '1.0.96', 'test/path/Cargo.yaml'),
      new PackageDescriptor([
        createPackageNameDesc('libc', createTextRange(300, 300)),
        createPackageVersionDesc('1.0.96', createTextRange(308, 314)),
        createPackageGroupDesc('workspace.dependencies', createTextRange(300, 315))
      ])
    ),
  ]
}
