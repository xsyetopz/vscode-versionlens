import {
  PackageSourceType,
  PackageVersionType
} from '#domain/packages';

export default {

  npmReplaceVersion: [
    // standard versions
    {
      suggestion: {
        parsedVersion: '1.2.3',
        suggestionVersion: '2.0.0',
        packageSource: PackageSourceType.Registry,
        packageVersionType: PackageVersionType.Version,
        parsedVersionPrepend: '',
        parsedVersionAppend: ''
      },
      expected: '2.0.0'
    },
    // preserve leading range
    {
      suggestion: {
        parsedVersion: '^1.2.3',
        suggestionVersion: '2.0.0',
        packageSource: PackageSourceType.Registry,
        packageVersionType: PackageVersionType.Range,
        parsedVersionPrepend: '',
        parsedVersionAppend: ''
      },
      expected: '^2.0.0'
    },
    {
      suggestion: {
        parsedVersion: '~1.2.3',
        suggestionVersion: '2.0.0',
        packageSource: PackageSourceType.Registry,
        packageVersionType: PackageVersionType.Range,
        parsedVersionPrepend: '',
        parsedVersionAppend: ''
      },
      expected: '~2.0.0'
    },
    // github versions
    {
      suggestion: {
        parsedVersion: 'github:user/repo#semver:^1.2.3',
        suggestionVersion: '2.0.0',
        fetchedVersion: '^1.2.3',
        packageSource: PackageSourceType.Github,
        packageVersionType: PackageVersionType.Range,
        parsedVersionPrepend: '',
        parsedVersionAppend: ''
      },
      expected: 'github:user/repo#semver:2.0.0'
    },
    // alias versions
    {
      suggestion: {
        parsedVersion: 'npm:other-package@^1.2.3',
        suggestionVersion: '2.0.0',
        fetchedVersion: '^1.2.3',
        fetchedName: 'other-package',
        packageSource: PackageSourceType.Registry,
        packageVersionType: PackageVersionType.Alias,
        parsedVersionPrepend: '',
        parsedVersionAppend: ''
      },
      expected: 'npm:other-package@^2.0.0'
    }
  ]

}
