import {
  PackageDescriptor,
  createPackageNameDesc,
  createPackageVersionDesc,
  createPackageGroupDesc,
  createTextRange,
  createProjectVersionTypeDesc
} from '#domain/parsers';

export default {

  parsesPipfilePackages: {
    test: `
[packages]
requests = "*"
flask = "==2.0.1"
numpy = {version = ">=1.21.0", extras = ["mkl"]}
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc("requests", createTextRange(12, 12)),
        createPackageVersionDesc("*", createTextRange(24, 25)),
        createPackageGroupDesc("packages", createTextRange(12, 26))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("flask", createTextRange(27, 27)),
        createPackageVersionDesc("==2.0.1", createTextRange(36, 43)),
        createPackageGroupDesc("packages", createTextRange(27, 44))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("numpy", createTextRange(45, 45)),
        createPackageVersionDesc(">=1.21.0", createTextRange(65, 73)),
        createPackageGroupDesc("packages", createTextRange(45, 93))
      ]),
    ]
  },

  parsesPipfileDevPackages: {
    test: `
[dev-packages]
pytest = ">=6.0"
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc("pytest", createTextRange(16, 16)),
        createPackageVersionDesc(">=6.0", createTextRange(26, 31)),
        createPackageGroupDesc("dev-packages", createTextRange(16, 32))
      ]),
    ]
  },

  parsesPipfileProject: {
    test: `
[project]
name = "my-project"
version = "1.2.3"
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc("version", createTextRange(31, 31)),
        createPackageVersionDesc("1.2.3", createTextRange(42, 47)),
        createProjectVersionTypeDesc()
      ]),
    ]
  }

}
