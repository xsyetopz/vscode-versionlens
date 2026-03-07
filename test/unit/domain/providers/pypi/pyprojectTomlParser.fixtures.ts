import {
  PackageDescriptor,
  createPackageNameDesc,
  createPackageVersionDesc,
  createPackageGroupDesc,
  createTextRange
} from '#domain/parsers';

export default {

  parsesPyprojectProjectDependencies: {
    test: `
[project]
dependencies = [
  "httpx",
  "django>2.1",
  "requests[security]==2.31.0"
]
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc("httpx", createTextRange(31, 36)),
        createPackageVersionDesc("", createTextRange(36, 36), "=="),
        createPackageGroupDesc("project", createTextRange(30, 37))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("django", createTextRange(42, 48)),
        createPackageVersionDesc(">2.1", createTextRange(48, 52)),
        createPackageGroupDesc("project", createTextRange(41, 53))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("requests", createTextRange(58, 66)),
        createPackageVersionDesc("==2.31.0", createTextRange(76, 84)),
        createPackageGroupDesc("project", createTextRange(57, 85))
      ]),
    ]
  },

  parsesPyprojectProjectDependenciesNoVersion: {
    test: `
[project]
dependencies = ["django"]
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc("django", createTextRange(28, 34)),
        createPackageVersionDesc("", createTextRange(34, 34), "=="),
        createPackageGroupDesc("project", createTextRange(27, 35))
      ]),
    ]
  },

  parsesPyprojectOptionalDependencies: {
    test: `
[project.optional-dependencies]
test = [
  "pytest",
  "pytest-cov>=4.0.0"
]
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc("pytest", createTextRange(45, 51)),
        createPackageVersionDesc("", createTextRange(51, 51), "=="),
        createPackageGroupDesc("project.optional-dependencies", createTextRange(44, 52))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("pytest-cov", createTextRange(57, 67)),
        createPackageVersionDesc(">=4.0.0", createTextRange(67, 74)),
        createPackageGroupDesc("project.optional-dependencies", createTextRange(56, 75))
      ]),
    ]
  },

  parsesPoetryDependencies: {
    test: `
[tool.poetry.dependencies]
python = "^3.10"
requests = { version = "^2.31.0", extras = ["security"] }
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc("python", createTextRange(28, 28)),
        createPackageVersionDesc("^3.10", createTextRange(38, 43)),
        createPackageGroupDesc("tool.poetry.dependencies", createTextRange(28, 44))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("requests", createTextRange(45, 45)),
        createPackageVersionDesc("^2.31.0", createTextRange(69, 76)),
        createPackageGroupDesc("tool.poetry.dependencies", createTextRange(45, 102))
      ]),
    ]
  }

}
