import {
  PackageDescriptor,
  createPackageGitDescType,
  createPackageNameDesc,
  createPackageGroupDesc,
  createPackagePathDescType,
  createPackageVersionDesc,
  createTextRange
} from '#domain/parsers';

export default {

  parsesDependencyEntries: {

    test: {
      "dependencies": {
        "Package1": "1.0.0",
        "Package2": "github:repo/project#semver:1.2.3",
        "Package3": "*",
        "ComplexPackage1": {
          "version": "1.2.3"
        },
        "NameOverrides@1": "1.0.0",
        "PathPackage1": {
          "path": "some/path/project"
        },
        "GitPackage1": {
          "repository": "git@github.com:munificent/kittens.git"
        },
      },
      "scripts": {
        "script1": "run me",
      }
    },

    expected: [
      new PackageDescriptor([
        createPackageNameDesc("Package1", createTextRange(17, 17)),
        createPackageVersionDesc("1.0.0", createTextRange(29, 34)),
        createPackageGroupDesc("dependencies", createTextRange(17, 35))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("Package2", createTextRange(36, 36)),
        createPackageVersionDesc("github:repo/project#semver:1.2.3", createTextRange(48, 80)),
        createPackageGroupDesc("dependencies", createTextRange(36, 81))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("Package3", createTextRange(82, 82)),
        createPackageVersionDesc("*", createTextRange(94, 95)),
        createPackageGroupDesc("dependencies", createTextRange(82, 96))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("ComplexPackage1", createTextRange(97, 97)),
        createPackageVersionDesc("1.2.3", createTextRange(127, 132)),
        createPackageGroupDesc("dependencies", createTextRange(97, 134))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("NameOverrides@1", createTextRange(135, 135)),
        createPackageVersionDesc("1.0.0", createTextRange(154, 159)),
        createPackageGroupDesc("dependencies", createTextRange(135, 160))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("PathPackage1", createTextRange(161, 161)),
        createPackagePathDescType("some/path/project", createTextRange(185, 202)),
        createPackageGroupDesc("dependencies", createTextRange(161, 204))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("GitPackage1", createTextRange(205, 205)),
        createPackageGitDescType("git@github.com:munificent/kittens.git"),
        createPackageGroupDesc("dependencies", createTextRange(205, 273))
      ]),
    ]
  },

  matchesPathExpressions: {
    test: {
      "overrides": {
        "parentPackage1": {
          "childPackage1": "2.0.0",
          "childPackage2": "3.0.0",
        },
        "parentPackage2": {
          "childPackage3": "4.0.0",
        }
      }
    },

    expected: [
      new PackageDescriptor([
        createPackageNameDesc("childPackage1", createTextRange(32, 32)),
        createPackageVersionDesc("2.0.0", createTextRange(49, 54)),
        createPackageGroupDesc("overrides", createTextRange(32, 55))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("childPackage2", createTextRange(56, 56)),
        createPackageVersionDesc("3.0.0", createTextRange(73, 78)),
        createPackageGroupDesc("overrides", createTextRange(56, 79))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("childPackage3", createTextRange(99, 99)),
        createPackageVersionDesc("4.0.0", createTextRange(116, 121)),
        createPackageGroupDesc("overrides", createTextRange(99, 122))
      ]),
    ]
  },
};
