import { CratesPackageVersionsResult } from '#domain/providers/cargo';

export default {
  test: {
    "versions": [
      {
        id: 1467241,
        num: "1.0.20",
        yanked: false,
      },
      {
        id: 1387307,
        num: "1.0.19",
        yanked: false,
      },
      {
        id: 1301608,
        num: "1.0.18",
        yanked: false,
      },
      {
        id: 1144605,
        num: "1.0.17",
        yanked: false,
      },
      {
        id: 1136694,
        num: "1.0.16",
        yanked: false,
      },
    ]
  },
  expected: <CratesPackageVersionsResult>{
    "versions": [
      {
        num: "1.0.20",
        yanked: false,
      },
      {
        num: "1.0.19",
        yanked: false,
      },
      {
        num: "1.0.18",
        yanked: false,
      },
      {
        num: "1.0.17",
        yanked: false,
      },
      {
        num: "1.0.16",
        yanked: false,
      },
    ]
  }
}