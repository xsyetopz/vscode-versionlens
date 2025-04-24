export default {
  test: `
v0.32.3
v0.19.10
v0.26.0
v0.23.0-alpha.3
v0.18.0-beta.0
v0.19.3-rc.0
v0.19.16
`,
  expected: {
    versions: [
      'v0.32.3',
      'v0.19.10',
      'v0.26.0',
      'v0.23.0-alpha.3',
      'v0.18.0-beta.0',
      'v0.19.3-rc.0',
      'v0.19.16'
    ]
  }
}