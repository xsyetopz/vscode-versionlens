import type { DockerRepository } from '#domain/providers/docker';

export default {
  test: <DockerRepository[]>[
    {
      name: '1',
      digest: 'sha256-123'
    },
    {
      name: '1.0',
      digest: 'sha256-123'
    },
    {
      name: '1.0.0',
      digest: 'sha256-123'
    },
    {
      name: '1.0.0-tag1',
      digest: 'sha256-123'
    },
    {
      name: 'lts',
      digest: 'sha256-123'
    },
    {
      name: '0.5.0',
      digest: 'sha256-987'
    }
  ],
  expected: {
    digestMapper: {
      digestMap: {
        'sha256-123': ['1', '1.0', '1.0.0', '1.0.0-tag1', 'lts'],
        'sha256-987': ['0.5.0']
      },
      tagMap: {
        '1': 'sha256-123',
        '1.0': 'sha256-123',
        '1.0.0': 'sha256-123',
        '1.0.0-tag1': 'sha256-123',
        'lts': 'sha256-123',
        '0.5.0': 'sha256-987'
      }
    },
    versionMapper: {
      versionMap: {
        '1.0.0': ['1.0.0', '1', '1.0', 'lts'],
        '1.0.0+tag1': ['1.0.0-tag1'],
        '0.5.0': ['0.5.0']
      },
      tagMap: {
        '1': '1.0.0',
        '1.0.0': '1.0.0',
        '1.0': '1.0.0',
        '1.0.0-tag1': '1.0.0+tag1',
        '0.5.0': '0.5.0',
        lts: '1.0.0',
      },
      releases: ['0.5.0', '1.0.0', '1.0.0+tag1'],
      latest: '1.0.0'
    }
  }
}