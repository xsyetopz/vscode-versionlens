import { PackageStatusFactory, UpdateableFactory } from '#domain/packages';

export default {
  registryVersion: {
    test: {
      packages: {
        "php-parallel-lint/php-parallel-lint": [
          {
            version: "v3.1.3",
          },
          {
            version: "v3.1.2",
          },
          {
            version: "v3.1.1",
          },
          {
            version: "v3.1.0",
          },
          {
            version: "v3.0.1",
          },
          {
            version: "v3.0",
          },
        ]
      }
    },
    expected1: [
      PackageStatusFactory.createMatchesLatestStatus('3.1.3')
    ],
    expected2: [
      PackageStatusFactory.createSatisifiesStatus('3.0.1'),
      UpdateableFactory.createLatestUpdateable('3.1.3'),
      UpdateableFactory.createNextMaxUpdateable('3.0.1', 'bump')
    ]
  }
}