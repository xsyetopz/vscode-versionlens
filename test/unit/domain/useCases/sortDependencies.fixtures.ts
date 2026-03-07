export default {

  returnsEmptyWhenNoDependenciesProvided: {
    test: "",
    expected: []
  },

  sortsSingleGroupOfDependenciesAlphabetically: {
    test: `{
  "dependencies": {
    "zebra": "1.0.0",
    "apple": "2.0.0"
  }
}`,
    expected: `{
  "dependencies": {
    "apple": "2.0.0",
    "zebra": "1.0.0"
  }
}`
  },

  sortsMultipleGroupsIndependently: {
    test: `{
  "dependencies": {
    "zebra": "1.0.0",
    "apple": "2.0.0"
  },
  "devDependencies": {
    "yarn": "1.0.0",
    "ant": "2.0.0"
  }
}`,
    expected: `{
  "dependencies": {
    "apple": "2.0.0",
    "zebra": "1.0.0"
  },
  "devDependencies": {
    "ant": "2.0.0",
    "yarn": "1.0.0"
  }
}`
  },

  doesntGenerateEditsIfAlreadySorted: {
    test: `{
  "dependencies": {
    "apple": "2.0.0",
    "zebra": "1.0.0"
  }
}`,
    expected: []
  },

  preservesAllEntriesAfterRequirementsTxtSort: {
    test: `# Requirements for smoke testing
requests==2.25.1
flask>=2.0
django<=3.2
pytest>3.0
numpy<1.22 # this should not cause issues
pandas~=1.2
urllib3===1.26.5
six==1.17.0
python-dateutil
not_found_package==1.17.0
`,
    expectedSorted: `
django<=3.2
flask>=2.0
not_found_package==1.17.0
numpy<1.22 # this should not cause issues
pandas~=1.2
pytest>3.0
python-dateutil
requests==2.25.1
six==1.17.0
urllib3===1.26.5
`
  },

  sortsComplexYamlDependenciesCorrectly: {
    test: `
dependencies:
  sqflite:
    git: 
      url: https://github.com/tekartik/sqflite
      path: sqflite
  equatable: ^0.2.0
`,
    expectedSorted: `
dependencies:
  equatable: ^0.2.0
  sqflite:
    git: 
      url: https://github.com/tekartik/sqflite
      path: sqflite
`
  },

  sortsYamlDependenciesWithCommentsCorrectly: {
    test: `
dependencies:
  # sqflite comment
  sqflite: ^1.0.0
  # equatable comment
  equatable: ^0.2.0
`,
    expectedSorted: `
dependencies:
  # equatable comment
  equatable: ^0.2.0
  # sqflite comment
  sqflite: ^1.0.0
`
  },

  sortsYamlDependenciesWithInlineCommentsCorrectly: {
    test: `
dependencies:
  zebra: ^1.0.0 # zebra inline comment
  apple: ^2.0.0 # apple inline comment
`,
    expectedSorted: `
dependencies:
  apple: ^2.0.0 # apple inline comment
  zebra: ^1.0.0 # zebra inline comment
`
  },

  sortsYamlDependenciesWithMixedCommentsCorrectly: {
    test: `
dependencies:
  http: # blank entry with comment
  glob: # version child property
    version: '1.2.*'
`,
    expectedSorted: `
dependencies:
  glob: # version child property
    version: '1.2.*'
  http: # blank entry with comment
`
  },

  sortsYamlDependenciesWithNoVersionAndNoSpaceCorrectly: {
    test: `
dependencies:
  flutter_bloc: 0.10.1
  equatable:
`,
    expectedSorted: `
dependencies:
  equatable:
  flutter_bloc: 0.10.1
`
  }

}
