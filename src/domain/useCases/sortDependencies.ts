import { PackageDependency } from '#domain/packages';
import {
  PackageDescriptorType,
  PackageGroupDescriptor
} from '#domain/parsers';
import { TextEdit } from './definitions';

/**
 * Use case for sorting package dependencies alphabetically within their groups.
 */
export class SortDependencies {

  /**
   * Executes the sort dependencies use case.
   * @param packageText The full content of the package file.
   * @param dependencies The list of identified dependencies.
   * @returns An array of text edits to apply.
   */
  execute(
    packageText: string,
    dependencies: Array<PackageDependency>
  ): Array<TextEdit> {
    const edits: Array<TextEdit> = [];

    // Group dependencies by group name
    const groups = new Map<string, Array<PackageDependency>>();
    for (const dep of dependencies) {
      const groupDesc = dep.descriptors.getType<PackageGroupDescriptor>(PackageDescriptorType.group);
      if (!groupDesc) continue;

      const groupName = groupDesc.groupName;
      if (!groups.has(groupName)) groups.set(groupName, []);

      groups.get(groupName)!.push(dep);
    }

    // Sort within each group and generate edits
    for (const groupDeps of groups.values()) {
      if (groupDeps.length <= 1) continue;

      // Sort alphabetically by name
      const sortedDeps = [...groupDeps].sort(
        (a, b) => a.package.name.localeCompare(b.package.name)
      );

      // Check if already sorted
      const isAlreadySorted = groupDeps.every(
        (dep, index) => dep.package.name === sortedDeps[index].package.name
      );
      if (isAlreadySorted) continue;

      // Map sorted text content to original ranges
      for (let i = 0; i < groupDeps.length; i++) {
        const originalDep = groupDeps[i];
        const sortedDep = sortedDeps[i];

        const originalEntryRange = originalDep.descriptors.getType<PackageGroupDescriptor>(
          PackageDescriptorType.group
        )?.range;

        const sortedEntryRange = sortedDep.descriptors.getType<PackageGroupDescriptor>(
          PackageDescriptorType.group
        )?.range;

        if (!originalEntryRange || !sortedEntryRange) continue;

        // Skip if same range and same content (though name check already covered most cases)
        const newText = packageText.substring(sortedEntryRange.start, sortedEntryRange.end);
        const oldText = packageText.substring(originalEntryRange.start, originalEntryRange.end);

        if (newText !== oldText) {
          edits.push({
            range: originalEntryRange,
            newText
          });
        }
      }
    }

    return edits;
  }

}
