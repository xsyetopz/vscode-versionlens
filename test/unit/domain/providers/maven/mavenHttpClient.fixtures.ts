export default {
  get: {
    test: `
      <?xml version="1.0" encoding="UTF-8"?>
      <metadata>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <versioning>
          <latest>4.13.2</latest>
          <release>4.13.2</release>
          <versions>
            <version>4.13-rc-1</version>
            <version>4.13-rc-2</version>
            <version>4.13</version>
            <version>4.13.1</version>
            <version>4.13.2</version>
          </versions>
          <lastUpdated>20210213164433</lastUpdated>
        </versioning>
      </metadata>
    `,
    expected: [
      "4.13-rc-1",
      "4.13-rc-2",
      "4.13",
      "4.13.1",
      "4.13.2",
    ],
  }
}