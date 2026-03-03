import {
  createPackageResource,
  PackageDependency
} from '#domain/packages';
import {
  createPackageNameDesc,
  createPackageVersionDesc,
  createPackageGroupDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';

/**
 * A regex to match PEP 508 requirements in requirements.txt.
 * Group 1: Package name
 * Group 2: Comparison operator (optional)
 * Group 3: Version (optional)
 */
const requirementRegex = /^\s*([a-zA-Z0-9._-]+)\s*(===|==|~=|>=|<=|!=|>|<)?\s*([a-zA-Z0-9._*+-]+)?/;

/**
 * Parses a requirements.txt file to identify package dependencies.
 * @param packagePath The path to the requirements.txt file.
 * @param packageText The content of the file.
 * @returns An array of identified package dependencies.
 */
export function parseRequirementsTxt(
  packagePath: string,
  packageText: string
): Array<PackageDependency> {
  const dependencies: Array<PackageDependency> = [];
  let currentOffset = 0;

  // Match each line including its delimiter to maintain accurate offsets
  const lines = packageText.match(/[^\r\n]*(\r?\n|$)/g) || [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
      const match = requirementRegex.exec(line);
      if (match) {
        const packageName = match[1];
        const operator = match[2] || '';
        const rawVersion = match[3] || '';

        // Calculate name range using the match index
        const nameStart = currentOffset + match.index + line.search(/\S/);
        const nameEnd = nameStart + packageName.length;

        // the version range includes the operator if present
        let versionRange;
        let descriptorVersion = '';

        if (rawVersion) {
          // find the operator start relative to the name
          const operatorStartInLine = operator ? line.indexOf(operator, match.index + packageName.length) : -1;
          const versionStartInLine = line.indexOf(rawVersion, operatorStartInLine !== -1 ? operatorStartInLine + operator.length : match.index + packageName.length);
          
          const start = operatorStartInLine !== -1 ? operatorStartInLine : versionStartInLine;
          const end = versionStartInLine + rawVersion.length;
          
          versionRange = createTextRange(
            currentOffset + start,
            currentOffset + end
          );
          // Combine operator and version for the descriptor and resource
          descriptorVersion = operator + rawVersion;
        } else {
          // Special case for blank versions: assume latest
          descriptorVersion = '*';
          versionRange = createTextRange(nameEnd);
        }

        // Exclude the trailing newline from the group range.
        // This ensures that when lines are swapped, the newlines remain in their original positions,
        // preventing the last line (which may not have a newline) from merging with other lines.
        const lineWithoutNewline = line.replace(/(\r?\n)$/, '');

        // Order is critical: Name descriptor must be before Version descriptor
        const descriptor = new PackageDescriptor([
          createPackageNameDesc(packageName, createTextRange(nameStart)),
          createPackageVersionDesc(descriptorVersion, versionRange),
          createPackageGroupDesc(
            'dependencies',
            createTextRange(currentOffset, currentOffset + lineWithoutNewline.length)
          )
        ]);

        dependencies.push(
          new PackageDependency(
            createPackageResource(
              packageName,
              descriptorVersion === '*' ? '' : descriptorVersion,
              packagePath
            ),
            descriptor
          )
        );
      }
    }

    currentOffset += line.length;
  }

  return dependencies;
}
