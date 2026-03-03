import { createPackageResource, PackageDependency } from '#domain/packages';
import {
  createPackageNameDesc,
  createPackageGroupDesc,
  createPackageVersionDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';

export default {
  parseDependencies: {
    yaml: {
      test: `
        catalog:
          react: ^16.14.0
        catalogs:
          react17:
            react: ^17.0.2
            react-dom: ^17.0.2
      `,
      expected: [
        new PackageDependency(
          createPackageResource('react', '^16.14.0', 'test/path/pnpm-workspace.yaml'),
          new PackageDescriptor([
            createPackageNameDesc('react', createTextRange(28)),
            createPackageVersionDesc('^16.14.0', createTextRange(35, 43)),
            createPackageGroupDesc('catalog', createTextRange(28, 43))
          ])
        ),
        new PackageDependency(
          createPackageResource('react', '^17.0.2', 'test/path/pnpm-workspace.yaml'),
          new PackageDescriptor([
            createPackageNameDesc('react', createTextRange(93)),
            createPackageVersionDesc('^17.0.2', createTextRange(100, 107)),
            createPackageGroupDesc('catalogs.react17', createTextRange(93, 107))
          ])
        ),
        new PackageDependency(
          createPackageResource('react-dom', '^17.0.2', 'test/path/pnpm-workspace.yaml'),
          new PackageDescriptor([
            createPackageNameDesc('react-dom', createTextRange(120)),
            createPackageVersionDesc('^17.0.2', createTextRange(131, 138)),
            createPackageGroupDesc('catalogs.react17', createTextRange(120, 138))
          ])
        ),
      ]
    }
  }
}
