export default {
  test: {
    versions: [
      {
        version: "~master",
        name: "imageformats",
      },
      {
        version: "1.0.0",
        name: "imageformats",
      },
      {
        version: "2.0.0",
        name: "imageformats",
      },
      {
        version: "2.0.1",
        name: "imageformats",
      },
      {
        version: "3.0.3",
        name: "imageformats",
      },
      {
        version: "3.0.4",
        name: "imageformats",
      },
    ]
  },
  expected: [
    "~master",
    "1.0.0",
    "2.0.0",
    "2.0.1",
    "3.0.3",
    "3.0.4",
  ]
}