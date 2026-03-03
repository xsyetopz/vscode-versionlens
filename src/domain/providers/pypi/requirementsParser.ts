import {
  createPackageResource,
  PackageDependency
} from '#domain/packages';
import {
  createPackageNameDesc,
  createPackageVersionDesc,
  createTextRange,
  PackageDescriptor
} from '#domain/parsers';

/**
 * A regex to match PEP 508 requirements in requirements.txt.
 * Group 1: Package name
 * Group 2: Comparison operator (optional)
 * Group 3: Version (optional)
 */
const requirementRegex = /^([a-zA-Z0-9._-]+)\s*(===|==|~=|>=|<=|!=|>|<)?\s*([a-zA-Z0-9._*+-]+)?/;

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

        // Calculate name range
        const nameStart = currentOffset + line.indexOf(packageName);

        // the version range includes the operator if present
        let versionRange;
        let descriptorVersion = '';

        if (rawVersion) {
          const operatorStart = operator ? line.indexOf(operator, line.indexOf(packageName) + packageName.length) : -1;
          const versionStart = line.indexOf(rawVersion, operatorStart !== -1 ? operatorStart + operator.length : line.indexOf(packageName) + packageName.length);
          const start = operatorStart !== -1 ? operatorStart : versionStart;
          const end = versionStart + rawVersion.length;
          versionRange = createTextRange(
            currentOffset + start,
            currentOffset + end
          );
          // Combine operator and version for the descriptor and resource
          descriptorVersion = operator + rawVersion;
        } else {
          // Special case for blank versions: assume latest
          descriptorVersion = '*';
          const endOfName = currentOffset + line.indexOf(packageName) + packageName.length;
          versionRange = createTextRange(endOfName);
        }

        // Order is critical: Name descriptor must be before Version descriptor
        const descriptor = new PackageDescriptor([
          createPackageNameDesc(packageName, createTextRange(nameStart)),
          createPackageVersionDesc(descriptorVersion, versionRange)
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
