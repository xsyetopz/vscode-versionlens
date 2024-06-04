import { KeyDictionary } from 'domain/utils';
import {
  SemVer,
  gt,
  maxSatisfying,
  minVersion,
  validRange
} from 'semver';
import { TPreReleaseGroup } from './definitions/tPreReleaseGroup';
import { loosePrereleases } from '../utils/versionUtils';
import { friendlifyPrereleaseName } from './friendlifyPrereleaseName';

export function filterPrereleasesGtMinRange(
  versionRange: string,
  prereleases: Array<string>
): Array<string> {
  // check we have a valid range (handles non-semver errors)
  const isValidRange = validRange(versionRange, loosePrereleases) !== null;
  const minVersionFromRange = isValidRange ?
    minVersion(versionRange, loosePrereleases) :
    versionRange;
  if (!minVersionFromRange) return [];

  const groupedByTag: KeyDictionary<TPreReleaseGroup> = {};

  // for each prerelease version;
  // group prereleases by x.x.x-{name}*.x
  prereleases.forEach(function (prereleaseVersion, order) {
    const spec = new SemVer(prereleaseVersion, loosePrereleases);
    const prereleaseTag = friendlifyPrereleaseName(prereleaseVersion) ?? spec.prerelease[0];

    // get or create the group
    const group = (Reflect.has(groupedByTag, prereleaseTag))
      ? groupedByTag[prereleaseTag]
      : groupedByTag[prereleaseTag] = {
        name: prereleaseTag,
        versions: [],
        order
      };

    group.versions.push(prereleaseVersion);
    if (group.order < order) group.order = order;
  });

  // order groups by published order
  const publishedOrder = Object.keys(groupedByTag)
    .map(key => groupedByTag[key])
    .sort((groupA, groupB) => {
      if (groupA.order < groupB.order) return -1
      if (groupA.order > groupB.order) return 1
      return 0;
    });

  // for each group;
  // extract versions that are greater than the min-range (latest from each group)
  const gtfn = isValidRange ? gt : maxSatisfying;
  const satisfiedPrereleases = [];
  publishedOrder.forEach(function (group) {
    const testMaxVersion = group.versions[group.versions.length - 1];
    const isPrereleaseGt = gtfn(
      testMaxVersion,
      minVersionFromRange,
      loosePrereleases
    );
    if (isPrereleaseGt) satisfiedPrereleases.push(testMaxVersion)
  });

  return satisfiedPrereleases;
}