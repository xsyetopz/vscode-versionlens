import {
  PackageDescriptor,
  createPackageGitDescType,
  createPackageNameDesc,
  createPackagePathDescType,
  createPackageVersionDesc,
  createProjectVersionTypeDesc,
  createPackageGroupDesc,
  createTextRange
} from '#domain/parsers';

export default {

  parsesDependencyEntries: {
    test: `
      [dependencies]
      serde = "1.0.97"
      indexmap = { version = "1.0", optional = true }

      [dependencies.awesome]
      version = "1.3.5"

      [dev-dependencies]
      serde_derive = "1.0"
      serde_json = "1.0"
      smallvec = { git = "https://github.com/servo/rust-smallvec.git" }
      bitflags = { path = "my-bitflags" }

      [tool.poetry.group.dev.dependencies]
      serde = "1.0.97"
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc(
          "serde",
          createTextRange(28, 28)
        ),
        createPackageVersionDesc("1.0.97", createTextRange(37, 43)),
        createPackageGroupDesc("dependencies", createTextRange(28, 44))
      ]),
      new PackageDescriptor([
        createPackageNameDesc(
          "indexmap",
          createTextRange(51, 51)
        ),
        createPackageVersionDesc("1.0", createTextRange(75, 78)),
        createPackageGroupDesc("dependencies", createTextRange(51, 98))
      ]),
      new PackageDescriptor([
        createPackageNameDesc(
          "awesome",
          createTextRange(120, 120)
        ),
        createPackageVersionDesc("1.3.5", createTextRange(146, 151)),
        createPackageGroupDesc("dependencies.awesome", createTextRange(135, 152))
      ]),
      new PackageDescriptor([
        createPackageNameDesc(
          "serde_derive",
          createTextRange(185, 185)
        ),
        createPackageVersionDesc("1.0", createTextRange(201, 204)),
        createPackageGroupDesc("dev-dependencies", createTextRange(185, 205))
      ]),
      new PackageDescriptor([
        createPackageNameDesc(
          "serde_json",
          createTextRange(212, 212)
        ),
        createPackageVersionDesc("1.0", createTextRange(226, 229)),
        createPackageGroupDesc("dev-dependencies", createTextRange(212, 230))
      ]),
      new PackageDescriptor([
        createPackageNameDesc(
          "smallvec",
          createTextRange(237, 237)
        ),
        createPackageGitDescType("https://github.com/servo/rust-smallvec.git"),
        createPackageGroupDesc("dev-dependencies", createTextRange(237, 302))
      ]),
      new PackageDescriptor([
        createPackageNameDesc(
          "bitflags",
          createTextRange(309, 309)
        ),
        createPackagePathDescType("my-bitflags", createTextRange(330, 341)),
        createPackageGroupDesc("dev-dependencies", createTextRange(309, 344))
      ]),
      new PackageDescriptor([
        createPackageNameDesc(
          "serde",
          createTextRange(395, 395)
        ),
        createPackageVersionDesc("1.0.97", createTextRange(404, 410)),
        createPackageGroupDesc("tool.poetry.group.dev.dependencies", createTextRange(395, 411))
      ]),
    ]
  },

  parsesPackageVersionEntries: {
    test: `
      [package]
      version = "1.0.97"
      description = "should ignore this field"

      [dev-dependencies]
      backtrace = "1.3.5"
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc("version", createTextRange(23, 23)),
        createPackageVersionDesc("1.0.97", createTextRange(34, 40)),
        createProjectVersionTypeDesc()
      ]),
      new PackageDescriptor([
        createPackageNameDesc("backtrace", createTextRange(121, 121)),
        createPackageVersionDesc("1.3.5", createTextRange(134, 139)),
        createPackageGroupDesc("dev-dependencies", createTextRange(121, 140))
      ]),
    ]
  },

  parsesProjectVersionEntries: {
    test: `
      [project]
      version = "1.0.97"
      description = "should ignore this field"

      [dev-dependencies]
      backtrace = "1.3.5"
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc("version", createTextRange(23, 23)),
        createPackageVersionDesc("1.0.97", createTextRange(34, 40)),
        createProjectVersionTypeDesc()
      ]),
      new PackageDescriptor([
        createPackageNameDesc("backtrace", createTextRange(121, 121)),
        createPackageVersionDesc("1.3.5", createTextRange(134, 139)),
        createPackageGroupDesc("dev-dependencies", createTextRange(121, 140))
      ]),
    ]
  },

  parsesPackageDependenciesEntries: {
    test: `
      [project]
      name = "should ignore this field"
      dependencies = [
        "httpx",
        "gidgethub>4.0.0",
        "django>2.1; os_name != 'nt'",
        "django>2.0; os_name == 'nt'"
      ]
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc("httpx", createTextRange(89, 94)),
        createPackageVersionDesc("", createTextRange(94, 94)),
        createPackageGroupDesc("project", createTextRange(88, 95))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("gidgethub", createTextRange(106, 115)),
        createPackageVersionDesc(">4.0.0", createTextRange(115, 121)),
        createPackageGroupDesc("project", createTextRange(105, 122))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("django", createTextRange(133, 139)),
        createPackageVersionDesc(">2.1", createTextRange(139, 143)),
        createPackageGroupDesc("project", createTextRange(132, 161))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("django", createTextRange(172, 178)),
        createPackageVersionDesc(">2.0", createTextRange(178, 182)),
        createPackageGroupDesc("project", createTextRange(171, 200))
      ]),
    ]
  },

  parsesPackageOptionalDependenciesEntries: {
    test: `
      [project.optional-dependencies]
      test = [
        "pytest < 5.0.0",
        "httpx==0.28.1"
      ]
      coverage = [
        "pytest-cov[all]",
        "pytest-cov[all]>2.0.0"
      ]
    `,
    expected: [
      new PackageDescriptor([
        createPackageNameDesc("pytest", createTextRange(63, 69)),
        createPackageVersionDesc("< 5.0.0", createTextRange(70, 77)),
        createPackageGroupDesc("project.optional-dependencies", createTextRange(62, 78))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("httpx", createTextRange(89, 94)),
        createPackageVersionDesc("==0.28.1", createTextRange(94, 102)),
        createPackageGroupDesc("project.optional-dependencies", createTextRange(88, 103))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("pytest-cov", createTextRange(140, 150)),
        createPackageVersionDesc("", createTextRange(155, 155)),
        createPackageGroupDesc("project.optional-dependencies", createTextRange(139, 156))
      ]),
      new PackageDescriptor([
        createPackageNameDesc("pytest-cov", createTextRange(167, 177)),
        createPackageVersionDesc(">2.0.0", createTextRange(182, 188)),
        createPackageGroupDesc("project.optional-dependencies", createTextRange(166, 189))
      ])
    ]
  }

}
