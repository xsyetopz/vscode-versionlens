import type { ILogger } from '#domain/logging';
import {
  type PackageClientRequest,
  type PackageClientResponse,
  type SemverSpec,
  PackageSourceType,
  VersionUtils,
  createSuggestions
} from '#domain/packages';
import type { ComposerConfig, PackagistClient } from '#domain/providers/composer';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class ComposerSuggestionResolver {

  constructor(
    readonly config: ComposerConfig,
    readonly packagistClient: PackagistClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('packagistClient', packagistClient);
    throwUndefinedOrNull('logger', logger);
  }

  async fromPackagist(
    request: PackageClientRequest<null>,
    semverSpec: SemverSpec
  ): Promise<PackageClientResponse> {
    // fetch
    const requestPackage = request.parsedDependency.package;
    const jsonResponse = await this.packagistClient.get(requestPackage.name);

    // process response
    const versionRange = semverSpec.rawVersion;

    const resolved = {
      name: requestPackage.name,
      version: versionRange,
    };

    const responseStatus = {
      source: jsonResponse.source,
      status: jsonResponse.status,
    };

    const responseVersions = jsonResponse.data.packages[requestPackage.name];
    const rawVersions: string[] = responseVersions
      .map(x => x.version)
      .toSorted(VersionUtils.compareVersionsAndBuilds)

    // extract semver versions only
    const semverVersions = VersionUtils.filterSemverVersions(rawVersions);

    // seperate versions to releases and prereleases
    const { releases, prereleases } = VersionUtils.splitReleasesFromArray(
      semverVersions,
      this.config.prereleaseTagFilter
    );

    // analyse suggestions
    const suggestions = createSuggestions(
      versionRange,
      releases,
      prereleases
    );

    return {
      source: PackageSourceType.Registry,
      responseStatus,
      type: semverSpec.type,
      resolved,
      suggestions,
    };
  }
}