import { createPackageManifest, PackageDependency } from '#domain/packages';
import {
  createPackageNameDesc,
  createPackageGroupDesc,
  createPackageVersionDesc,
  createProjectVersionTypeDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';

export default {
  test: `{
    "name": "test",
    "description": "tests",
    "version": "1.0.0",
    "require": {
      "php": "^7.1.3",
      "allocine/twigcs": "^3.0.0",
      "phpunit/phpunit": "8.2.1",
      "symfony/console": "4.1.*"
    },
    "require-dev": {
      "symfony/dotenv": "4.1.*",
      "squizlabs/php_codesniffer": "^2.8"
    }
  }
  `,
  expected: <PackageDependency[]>[
    new PackageDependency(
      createPackageManifest('1.0.0', '1.0.0', 'test/path/composer.json'),
      new PackageDescriptor([
        createPackageNameDesc('1.0.0', createTextRange(65, 65)),
        createPackageVersionDesc('1.0.0', createTextRange(66, 71)),
        createPackageGroupDesc('version', createTextRange(54, 72)),
        createProjectVersionTypeDesc()
      ])
    ),
    new PackageDependency(
      createPackageManifest('php', '^7.1.3', 'test/path/composer.json'),
      new PackageDescriptor([
        createPackageNameDesc('php', createTextRange(97, 97)),
        createPackageVersionDesc('^7.1.3', createTextRange(105, 111)),
        createPackageGroupDesc('require', createTextRange(97, 112))
      ])
    ),
    new PackageDependency(
      createPackageManifest('allocine/twigcs', '^3.0.0', 'test/path/composer.json'),
      new PackageDescriptor([
        createPackageNameDesc('allocine/twigcs', createTextRange(120, 120)),
        createPackageVersionDesc('^3.0.0', createTextRange(140, 146)),
        createPackageGroupDesc('require', createTextRange(120, 147))
      ])
    ),
    new PackageDependency(
      createPackageManifest('phpunit/phpunit', '8.2.1', 'test/path/composer.json'),
      new PackageDescriptor([
        createPackageNameDesc('phpunit/phpunit', createTextRange(155, 155)),
        createPackageVersionDesc('8.2.1', createTextRange(175, 180)),
        createPackageGroupDesc('require', createTextRange(155, 181))
      ])
    ),
    new PackageDependency(
      createPackageManifest('symfony/console', '4.1.*', 'test/path/composer.json'),
      new PackageDescriptor([
        createPackageNameDesc('symfony/console', createTextRange(189, 189)),
        createPackageVersionDesc('4.1.*', createTextRange(209, 214)),
        createPackageGroupDesc('require', createTextRange(189, 215))
      ])
    ),
    new PackageDependency(
      createPackageManifest('symfony/dotenv', '4.1.*', 'test/path/composer.json'),
      new PackageDescriptor([
        createPackageNameDesc('symfony/dotenv', createTextRange(250, 250)),
        createPackageVersionDesc('4.1.*', createTextRange(269, 274)),
        createPackageGroupDesc('require-dev', createTextRange(250, 275))
      ])
    ),
    new PackageDependency(
      createPackageManifest('squizlabs/php_codesniffer', '^2.8', 'test/path/composer.json'),
      new PackageDescriptor([
        createPackageNameDesc('squizlabs/php_codesniffer', createTextRange(283, 283)),
        createPackageVersionDesc('^2.8', createTextRange(313, 317)),
        createPackageGroupDesc('require-dev', createTextRange(283, 318))
      ])
    ),

  ]
}
