export default {
  complex: {
    test: `
      1-1:
        2-1:
          3-1:
            name: test1
            version: 123
          3-2:
            name: test2
            version: 234
        2-2:
          3-3:
            name: test3
            version: 345
          3-4:
            name: test4
            version: 456
    `,
    expected1: [
      { name: "test1" },
      { version: 123 }
    ],
    expected2: [
      { '3-1': { name: "test1", version: 123 } },
      { '3-2': { name: "test2", version: 234 } }
    ],
    expected3: [
      { '3-1': { name: "test1", version: 123 } },
      { '3-2': { name: "test2", version: 234 } },
      { '3-3': { name: "test3", version: 345 } },
      { '3-4': { name: "test4", version: 456 } }
    ]
  }
}