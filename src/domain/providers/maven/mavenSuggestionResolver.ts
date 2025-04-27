import type { ILogger } from '#domain/logging';
import {
  type PackageClientRequest,
  type PackageClientResponse,
  type SemverSpec,
  ClientResponseFactory,
  PackageSourceType,
  VersionUtils,
  createSuggestions
} from '#domain/packages';
import type {
  MavenClientData,
  MavenConfig,
  MavenHttpClient
} from '#domain/providers/maven';
import { throwUndefinedOrNull } from '@esm-test/guards';
import { valid } from 'semver';

export class MavenSuggestionResolver {

  constructor(
    readonly config: MavenConfig,
    readonly mavenHttpClient: MavenHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('mavenHttpClient', mavenHttpClient);
    throwUndefinedOrNull('logger', logger);
  }

  async fromMavenApi(
    repos: string[],
    request: PackageClientRequest<MavenClientData>,
    semverSpec: SemverSpec
  ): Promise<PackageClientResponse> {
    // fetch
    const requestedPackage = request.parsedDependency.package;
    const httpResponse = await this.mavenHttpClient.get(requestedPackage.name, repos);

    // process response
    const source = PackageSourceType.Registry;
    const versionRange = semverSpec.rawVersion;

    // extract semver versions only
    const semverVersions = VersionUtils.filterSemverVersions(httpResponse.data)
      .filter(x => !!valid(x))
      .toSorted(VersionUtils.compareVersionsAndBuilds);

    // seperate versions to releases and prereleases
    const { releases, prereleases } = VersionUtils.splitReleasesFromArray(
      semverVersions,
      this.config.prereleaseTagFilter
    );

    const resolved = {
      name: requestedPackage.name,
      version: versionRange,
    };

    // analyse suggestions
    const suggestions = createSuggestions(
      versionRange,
      releases,
      prereleases
    );

    return {
      source,
      responseStatus: ClientResponseFactory.mapStatusFromJsonResponse(httpResponse),
      type: semverSpec.type,
      resolved,
      suggestions,
    };
  }

}