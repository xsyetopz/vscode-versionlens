export default {

  suggestionReplaceFn: [
    {
      suggestion: { 
        parsedVersion: '*',
        parsedVersionPrepend: ", '",
        parsedVersionAppend: "'"
      },
      newVersion: '6.0.0',
      expected: ", '6.0.0'"
    },
    {
      suggestion: { 
        parsedVersion: '1.2.3',
        parsedVersionPrepend: '',
        parsedVersionAppend: ''
      },
      newVersion: '2.0.0',
      expected: '2.0.0'
    },
    {
      suggestion: { 
        parsedVersion: '~> 1.2.3',
        parsedVersionPrepend: '',
        parsedVersionAppend: ''
      },
      newVersion: '2.0.0',
      expected: '~> 2.0.0'
    },
    {
      suggestion: { 
        parsedVersion: '>= 1.2.3',
        parsedVersionPrepend: '',
        parsedVersionAppend: ''
      },
      newVersion: '2.0.0',
      expected: '>= 2.0.0'
    }
  ]

}
