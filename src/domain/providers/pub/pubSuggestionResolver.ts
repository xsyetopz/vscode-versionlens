import type { ILogger } from '#domain/logging';
import {
  type PackageClientResponse,
  type PackageDependency,
  type SemverSpec,
  ClientResponseFactory,
  PackageSourceType,
  VersionUtils,
  createSuggestions
} from '#domain/packages';
import type { PackagePathDescriptor } from '#domain/parsers';
import type { PubConfig, PubJsonClient } from '#domain/providers/pub';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class PubSuggestionResolver {

  constructor(
    readonly config: PubConfig,
    readonly pubJsonClient: PubJsonClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("pubJsonClient", pubJsonClient);
    throwUndefinedOrNull("logger", logger);
  }

  fromPath(dep: PackageDependency, pathDesc: PackagePathDescriptor) {
    return ClientResponseFactory.createDirectory(
      dep.package.name,
      dep.package.path,
      pathDesc.path
    );
  }

  fromGit() {
    return ClientResponseFactory.createGit();
  }

  async fromPubApi(
    url: string,
    packageName: string,
    semverSpec: SemverSpec
  ): Promise<PackageClientResponse> {
    // fetch
    const jsonResponse = await this.pubJsonClient.get(url);

    // process response
    const versionRange = semverSpec.rawVersion;

    const resolved = {
      name: packageName,
      version: versionRange,
    };

    // sort versions
    const rawVersions = jsonResponse.data.versions
      .toSorted(VersionUtils.compareVersionsAndBuilds);

    // seperate versions to releases and prereleases
    const { releases, prereleases } = VersionUtils.splitReleasesFromArray(
      rawVersions,
      this.config.prereleaseTagFilter
    );

    // analyse suggestions
    const suggestions = createSuggestions(
      versionRange,
      releases,
      prereleases
    );

    // return PackageDocument
    return {
      source: PackageSourceType.Registry,
      responseStatus: ClientResponseFactory.mapStatusFromJsonResponse(jsonResponse),
      type: semverSpec.type,
      resolved,
      suggestions,
    };
  }

}