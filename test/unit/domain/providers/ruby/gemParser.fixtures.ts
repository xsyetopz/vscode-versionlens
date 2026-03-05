import {
  createPackageManifest,
  PackageDependency
} from '#domain/packages';
import {
  createPackageNameDesc,
  createPackageVersionDesc,
  createPackagePathDescType,
  createPackageGitDescType,
  createPackageGroupDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';

export default {

  // parses dependencies from Gemfile
  general: {
    test: `
ruby '2.5.0'
gem 'rails', '~> 5.2.1'
gem 'sqlite3'
gem 'puma', '~> 3.11'
gem 'bootsnap', '>= 1.1.0', require: false
`,
    expected: [
      new PackageDependency(
        createPackageManifest('rails', '~> 5.2.1', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('rails', createTextRange(14)),
          createPackageVersionDesc('~> 5.2.1', createTextRange(28, 36)),
          createPackageGroupDesc('dependencies', createTextRange(14, 37))
        ])
      ),
      new PackageDependency(
        createPackageManifest('sqlite3', '', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('sqlite3', createTextRange(38)),
          createPackageVersionDesc('*', createTextRange(51), ", '", "'"),
          createPackageGroupDesc('dependencies', createTextRange(38, 51))
        ])
      ),
      new PackageDependency(
        createPackageManifest('puma', '~> 3.11', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('puma', createTextRange(52)),
          createPackageVersionDesc('~> 3.11', createTextRange(65, 72)),
          createPackageGroupDesc('dependencies', createTextRange(52, 73))
        ])
      ),
      new PackageDependency(
        createPackageManifest('bootsnap', '>= 1.1.0', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('bootsnap', createTextRange(74)),
          createPackageVersionDesc('>= 1.1.0', createTextRange(91, 99)),
          createPackageGroupDesc('dependencies', createTextRange(74, 116))
        ])
      )
    ]
  },

  // parses path dependencies from Gemfile
  path: {
    test: `
gem 'rails', path: 'vendor/rails'
gem 'sqlite3', path: "vendor/sqlite3"
`,
    expected: [
      new PackageDependency(
        createPackageManifest('rails', 'vendor/rails', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('rails', createTextRange(1)),
          createPackagePathDescType('vendor/rails', createTextRange(21, 33)),
          createPackageGroupDesc('dependencies', createTextRange(1, 34))
        ])
      ),
      new PackageDependency(
        createPackageManifest('sqlite3', 'vendor/sqlite3', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('sqlite3', createTextRange(35)),
          createPackagePathDescType('vendor/sqlite3', createTextRange(57, 71)),
          createPackageGroupDesc('dependencies', createTextRange(35, 72))
        ])
      )
    ]
  },

  // parses git dependencies from Gemfile
  git: {
    test: `
gem 'rails', git: 'https://github.com/rails/rails.git'
gem 'sqlite3', git: "https://github.com/sparklemotion/sqlite3-ruby.git"
`,
    expected: [
      new PackageDependency(
        createPackageManifest('rails', 'https://github.com/rails/rails.git', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('rails', createTextRange(1)),
          createPackageGitDescType('https://github.com/rails/rails.git'),
          createPackageGroupDesc('dependencies', createTextRange(1, 55))
        ])
      ),
      new PackageDependency(
        createPackageManifest('sqlite3', 'https://github.com/sparklemotion/sqlite3-ruby.git', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('sqlite3', createTextRange(56)),
          createPackageGitDescType('https://github.com/sparklemotion/sqlite3-ruby.git'),
          createPackageGroupDesc('dependencies', createTextRange(56, 127))
        ])
      )
    ]
  },

  // parses github dependencies from Gemfile
  github: {
    test: `
gem 'rails', github: 'rails/rails'
gem 'sqlite3', github: "sparklemotion/sqlite3-ruby"
`,
    expected: [
      new PackageDependency(
        createPackageManifest('rails', 'rails/rails', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('rails', createTextRange(1)),
          createPackageGitDescType('https://github.com/rails/rails.git'),
          createPackageGroupDesc('dependencies', createTextRange(1, 35))
        ])
      ),
      new PackageDependency(
        createPackageManifest('sqlite3', 'sparklemotion/sqlite3-ruby', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('sqlite3', createTextRange(36)),
          createPackageGitDescType('https://github.com/sparklemotion/sqlite3-ruby.git'),
          createPackageGroupDesc('dependencies', createTextRange(36, 87))
        ])
      )
    ]
  },

  // parses git reference dependencies from Gemfile
  gitRefs: {
    test: `
gem 'rails', git: 'git://github.com/rails/rails.git', ref: '4aded'
gem 'rails', git: 'git://github.com/rails/rails.git', branch: '2-3-stable'
gem 'rails', git: 'git://github.com/rails/rails.git', tag: 'v2.3.5'
`,
    expected: [
      new PackageDependency(
        createPackageManifest('rails', 'git://github.com/rails/rails.git', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('rails', createTextRange(1)),
          createPackageGitDescType('git://github.com/rails/rails.git', '', '4aded'),
          createPackageGroupDesc('dependencies', createTextRange(1, 67))
        ])
      ),
      new PackageDependency(
        createPackageManifest('rails', 'git://github.com/rails/rails.git', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('rails', createTextRange(68)),
          createPackageGitDescType('git://github.com/rails/rails.git', '', '2-3-stable'),
          createPackageGroupDesc('dependencies', createTextRange(68, 142))
        ])
      ),
      new PackageDependency(
        createPackageManifest('rails', 'git://github.com/rails/rails.git', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('rails', createTextRange(143)),
          createPackageGitDescType('git://github.com/rails/rails.git', '', 'v2.3.5'),
          createPackageGroupDesc('dependencies', createTextRange(143, 210))
        ])
      )
    ]
  },

  // parses dependencies with comments from Gemfile
  withComments: {
    test: `
gem 'library1', '>= 2.2.0' # test '1.2.3'
`,
    expected: [
      new PackageDependency(
        createPackageManifest('library1', '>= 2.2.0', 'Gemfile'),
        new PackageDescriptor([
          createPackageNameDesc('library1', createTextRange(1)),
          createPackageVersionDesc('>= 2.2.0', createTextRange(18, 26)),
          createPackageGroupDesc('dependencies', createTextRange(1, 42))
        ])
      )
    ]
  }

}
