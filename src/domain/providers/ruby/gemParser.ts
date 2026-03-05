import {
  createPackageManifest,
  PackageDependency
} from '#domain/packages';
import {
  createPackageNameDesc,
  createPackageVersionDesc,
  createPackagePathDescType,
  createPackageGitDescType,
  createPackageGroupDesc,
  createTextRange,
  PackageDescriptor,
  type PackageTypeDescriptor
} from '#domain/parsers';

/**
 * A regex to match gem name in Gemfile.
 * Group 1: Quote char for name
 * Group 2: Package name
 */
const gemNameRegex = /^\s*gem\s+(['"])(?<name>[^'"]+)\1/;

/**
 * Regexes for gem options
 */
const versionRegex = /,\s*(['"])(?<version>[^'"]+)\1/;
const pathRegex = /,\s*path:\s*(['"])(?<path>[^'"]+)\1/;
const gitRegex = /,\s*git:\s*(['"])(?<git>[^'"]+)\1/;
const githubRegex = /,\s*github:\s*(['"])(?<github>[^'"]+)\1/;
const refRegex = /,\s*ref:\s*(['"])(?<ref>[^'"]+)\1/;
const branchRegex = /,\s*branch:\s*(['"])(?<branch>[^'"]+)\1/;
const tagRegex = /,\s*tag:\s*(['"])(?<tag>[^'"]+)\1/;

/**
 * Parses a Gemfile to identify package dependencies.
 * @param packagePath The path to the Gemfile.
 * @param packageText The content of the file.
 * @returns An array of identified package dependencies.
 */
export function parseGemfile(
  packagePath: string,
  packageText: string
): Array<PackageDependency> {
  const dependencies: Array<PackageDependency> = [];
  let currentOffset = 0;

  const lines = packageText.match(/[^\r\n]*(\r?\n|$)/g) || [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
      const nameMatch = gemNameRegex.exec(line);
      if (nameMatch) {
        const groups = nameMatch.groups!;
        const packageName = groups.name;

        // Calculate name range (at the start of the 'gem' for CodeLens positioning)
        const nameStart = currentOffset + line.indexOf('gem');

        const descriptors: Array<PackageTypeDescriptor> = [
          createPackageNameDesc(packageName, createTextRange(nameStart))
        ];

        let manifestVersion = '';

        // Parse options
        const pathMatch = pathRegex.exec(line);
        const gitMatch = gitRegex.exec(line);
        const githubMatch = githubRegex.exec(line);
        const versionMatch = versionRegex.exec(line);
        const refMatch = refRegex.exec(line) || branchRegex.exec(line) || tagRegex.exec(line);

        if (githubMatch) {
          const githubUrl = `https://github.com/${githubMatch.groups!.github}.git`;
          const gitRef = refMatch ? (refMatch.groups!.ref || refMatch.groups!.branch || refMatch.groups!.tag) : '';
          descriptors.push(createPackageGitDescType(githubUrl, '', gitRef));
          manifestVersion = githubMatch.groups!.github;
        } else if (gitMatch) {
          const gitUrl = gitMatch.groups!.git;
          const gitRef = refMatch ? (refMatch.groups!.ref || refMatch.groups!.branch || refMatch.groups!.tag) : '';
          descriptors.push(createPackageGitDescType(gitUrl, '', gitRef));
          manifestVersion = gitUrl;
        } else if (pathMatch) {
          const rawPath = pathMatch.groups!.path;
          const pathStartInLine = line.indexOf(rawPath, line.indexOf('path:'));
          const pathRange = createTextRange(
            currentOffset + pathStartInLine,
            currentOffset + pathStartInLine + rawPath.length
          );
          descriptors.push(createPackagePathDescType(rawPath, pathRange));
          manifestVersion = rawPath;
        } else if (versionMatch) {
          const rawVersion = versionMatch.groups!.version;
          const versionStartInLine = line.indexOf(rawVersion, line.indexOf(packageName) + packageName.length);
          const versionRange = createTextRange(
            currentOffset + versionStartInLine,
            currentOffset + versionStartInLine + rawVersion.length
          );
          descriptors.push(createPackageVersionDesc(rawVersion, versionRange));
          manifestVersion = rawVersion;
        } else {
          // Special case for blank versions: assume latest
          const nameEndInLine = line.indexOf(packageName) + packageName.length + 1;
          const versionRange = createTextRange(currentOffset + nameEndInLine);
          descriptors.push(createPackageVersionDesc('*', versionRange, ", '", "'"));
          manifestVersion = '';
        }

        const lineWithoutNewline = line.replace(/(\r?\n)$/, '');
        descriptors.push(
          createPackageGroupDesc(
            'dependencies',
            createTextRange(currentOffset, currentOffset + lineWithoutNewline.length)
          )
        );

        dependencies.push(
          new PackageDependency(
            createPackageManifest(
              packageName,
              manifestVersion,
              packagePath
            ),
            new PackageDescriptor(descriptors)
          )
        );
      }
    }

    currentOffset += line.length;
  }

  return dependencies;
}
