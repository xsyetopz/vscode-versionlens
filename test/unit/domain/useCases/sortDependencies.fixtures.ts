import { createPackageManifest, PackageDependency } from '#domain/packages';
import {
  createPackageGroupDesc,
  createPackageNameDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';

export default {

  returnsEmptyWhenNoDependenciesProvided: {
    test: "",
    dependencies: [],
    expected: []
  },

  sortsSingleGroupOfDependenciesAlphabetically: {
    test: '{\n  "dependencies": {\n    "zebra": "1.0.0",\n    "apple": "2.0.0"\n  }\n}',
    get dependencies() {
      const packageText = this.test;
      const zebraText = '"zebra": "1.0.0"';
      const zebraStart = packageText.indexOf(zebraText);
      const zebraRange = createTextRange(zebraStart, zebraStart + zebraText.length);

      const appleText = '"apple": "2.0.0"';
      const appleStart = packageText.indexOf(appleText);
      const appleRange = createTextRange(appleStart, appleStart + appleText.length);

      return [
        new PackageDependency(
          { name: 'zebra', version: '1.0.0' } as any,
          new PackageDescriptor([
            createPackageNameDesc('zebra', createTextRange(zebraStart)),
            createPackageGroupDesc('dependencies', zebraRange)
          ])
        ),
        new PackageDependency(
          { name: 'apple', version: '2.0.0' } as any,
          new PackageDescriptor([
            createPackageNameDesc('apple', createTextRange(appleStart)),
            createPackageGroupDesc('dependencies', appleRange)
          ])
        )
      ];
    },
    expected: [
      { range: createTextRange(17, 33), newText: '"apple": "2.0.0"' },
      { range: createTextRange(38, 54), newText: '"zebra": "1.0.0"' }
    ]
  },

  sortsMultipleGroupsIndependently: {
    test: '{\n  "dependencies": {\n    "zebra": "1.0.0",\n    "apple": "2.0.0"\n  },\n  "devDependencies": {\n    "yarn": "1.0.0",\n    "ant": "2.0.0"\n  }\n}',
    get dependencies() {
      const packageText = this.test;
      const zebraText = '"zebra": "1.0.0"';
      const zebraStart = packageText.indexOf(zebraText);
      const zebraRange = createTextRange(zebraStart, zebraStart + zebraText.length);

      const appleText = '"apple": "2.0.0"';
      const appleStart = packageText.indexOf(appleText);
      const appleRange = createTextRange(appleStart, appleStart + appleText.length);

      const yarnText = '"yarn": "1.0.0"';
      const yarnStart = packageText.indexOf(yarnText);
      const yarnRange = createTextRange(yarnStart, yarnStart + yarnText.length);

      const antText = '"ant": "2.0.0"';
      const antStart = packageText.indexOf(antText);
      const antRange = createTextRange(antStart, antStart + antText.length);

      return [
        new PackageDependency(
          { name: 'zebra', version: '1.0.0' } as any,
          new PackageDescriptor([
            createPackageNameDesc('zebra', createTextRange(zebraStart)),
            createPackageGroupDesc('dependencies', zebraRange)
          ])
        ),
        new PackageDependency(
          { name: 'apple', version: '2.0.0' } as any,
          new PackageDescriptor([
            createPackageNameDesc('apple', createTextRange(appleStart)),
            createPackageGroupDesc('dependencies', appleRange)
          ])
        ),
        new PackageDependency(
          { name: 'yarn', version: '1.0.0' } as any,
          new PackageDescriptor([
            createPackageNameDesc('yarn', createTextRange(yarnStart)),
            createPackageGroupDesc('devDependencies', yarnRange)
          ])
        ),
        new PackageDependency(
          { name: 'ant', version: '2.0.0' } as any,
          new PackageDescriptor([
            createPackageNameDesc('ant', createTextRange(antStart)),
            createPackageGroupDesc('devDependencies', antRange)
          ])
        )
      ];
    }
  },

  doesntGenerateEditsIfAlreadySorted: {
    test: '{\n  "dependencies": {\n    "apple": "2.0.0",\n    "zebra": "1.0.0"\n  }\n}',
    get dependencies() {
      const packageText = this.test;
      const appleText = '"apple": "2.0.0"';
      const appleStart = packageText.indexOf(appleText);
      const appleRange = createTextRange(appleStart, appleStart + appleText.length);

      const zebraText = '"zebra": "1.0.0"';
      const zebraStart = packageText.indexOf(zebraText);
      const zebraRange = createTextRange(zebraStart, zebraStart + zebraText.length);

      return [
        new PackageDependency(
          { name: 'apple', version: '2.0.0' } as any,
          new PackageDescriptor([
            createPackageNameDesc('apple', createTextRange(appleStart)),
            createPackageGroupDesc('dependencies', appleRange)
          ])
        ),
        new PackageDependency(
          { name: 'zebra', version: '1.0.0' } as any,
          new PackageDescriptor([
            createPackageNameDesc('zebra', createTextRange(zebraStart)),
            createPackageGroupDesc('dependencies', zebraRange)
          ])
        )
      ];
    },
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
    get dependencies() {
      const packageText = this.test;
      const lines = [
        "requests==2.25.1\n",
        "flask>=2.0\n",
        "django<=3.2\n",
        "pytest>3.0\n",
        "numpy<1.22 # this should not cause issues\n",
        "pandas~=1.2\n",
        "urllib3===1.26.5\n",
        "six==1.17.0\n",
        "python-dateutil\n",
        "not_found_package==1.17.0\n"
      ];

      const dependencies: Array<PackageDependency> = [];
      let currentOffset = packageText.indexOf(lines[0]);

      for (const line of lines) {
        const nameMatch = line.match(/^([a-zA-Z0-9._-]+)/);
        const name = nameMatch![1];
        const start = currentOffset;
        const lineWithoutNewline = line.replace(/(\r?\n)$/, '');
        const end = currentOffset + lineWithoutNewline.length;

        const dep = new PackageDependency(
          createPackageManifest(name, '', 'requirements.txt'),
          new PackageDescriptor([
            createPackageNameDesc(name, createTextRange(start)),
            createPackageGroupDesc('dependencies', createTextRange(start, end))
          ])
        );
        dependencies.push(dep);
        currentOffset += line.length;
      }
      return dependencies;
    },
    expectedSorted: [
      "django<=3.2",
      "flask>=2.0",
      "not_found_package==1.17.0",
      "numpy<1.22 # this should not cause issues",
      "pandas~=1.2",
      "pytest>3.0",
      "python-dateutil",
      "requests==2.25.1",
      "six==1.17.0",
      "urllib3===1.26.5"
    ]
  }

}
