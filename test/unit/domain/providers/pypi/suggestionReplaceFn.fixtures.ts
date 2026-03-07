export default {

  suggestionReplaceFn: [
    // no operator -> no operator
    {
      suggestion: { parsedVersion: '1.2.3', parsedVersionPrepend: '', parsedVersionAppend: '' },
      newVersion: '2.0.0',
      expected: '2.0.0'
    },
    // == -> ==
    {
      suggestion: { parsedVersion: '==1.2.3', parsedVersionPrepend: '', parsedVersionAppend: '' },
      newVersion: '2.0.0',
      expected: '==2.0.0'
    },
    // >= -> >=
    {
      suggestion: { parsedVersion: '>=1.2.3', parsedVersionPrepend: '', parsedVersionAppend: '' },
      newVersion: '2.0.0',
      expected: '>=2.0.0'
    },
    // > -> >=
    {
      suggestion: { parsedVersion: '>1.2.3', parsedVersionPrepend: '', parsedVersionAppend: '' },
      newVersion: '2.0.0',
      expected: '>=2.0.0'
    },
    // <= -> <=
    {
      suggestion: { parsedVersion: '<=1.2.3', parsedVersionPrepend: '', parsedVersionAppend: '' },
      newVersion: '2.0.0',
      expected: '<=2.0.0'
    },
    // < -> <=
    {
      suggestion: { parsedVersion: '<1.2.3', parsedVersionPrepend: '', parsedVersionAppend: '' },
      newVersion: '2.0.0',
      expected: '<=2.0.0'
    },
    // ~= -> ~=
    {
      suggestion: { parsedVersion: '~=1.2.3', parsedVersionPrepend: '', parsedVersionAppend: '' },
      newVersion: '2.0.0',
      expected: '~=2.0.0'
    },
    // != -> !=
    {
      suggestion: { parsedVersion: '!=1.2.3', parsedVersionPrepend: '', parsedVersionAppend: '' },
      newVersion: '2.0.0',
      expected: '!=2.0.0'
    },
    // === -> ===
    {
      suggestion: { parsedVersion: '===1.2.3', parsedVersionPrepend: '', parsedVersionAppend: '' },
      newVersion: '2.0.0',
      expected: '===2.0.0'
    },
    // multi-constraint with upper bound
    {
      suggestion: { parsedVersion: '>=1.0.0, <2.0.0', parsedVersionPrepend: '', parsedVersionAppend: '' },
      newVersion: '2.1.0',
      expected: '>=1.0.0, <=2.1.0'
    },
    // multi-constraint with only lower bounds
    {
      suggestion: { parsedVersion: '>=1.0.0, !=1.1.0', parsedVersionPrepend: '', parsedVersionAppend: '' },
      newVersion: '2.0.0',
      expected: '>=2.0.0, !=1.1.0'
    },
    // empty version -> no operator
    {
      suggestion: { parsedVersion: '', parsedVersionPrepend: '==', parsedVersionAppend: '' },
      newVersion: '1.2.3',
      expected: '==1.2.3'
    }
  ]

}
