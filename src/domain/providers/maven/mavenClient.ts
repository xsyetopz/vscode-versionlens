import type { HttpClientResponse } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import {
  type IPackageClient,
  type PackageClientRequest,
  type PackageClientResponse,
  type SemverSpec,
  ClientResponseFactory,
  PackageSourceType,
  PackageStatusFactory,
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

export class MavenClient implements IPackageClient<MavenClientData> {

  constructor(
    readonly config: MavenConfig,
    readonly mavenHttpClient: MavenHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("mavenHttpClient", mavenHttpClient);
    throwUndefinedOrNull("logger", logger);
  }

  async fetchPackage(
    request: PackageClientRequest<MavenClientData>
  ): Promise<PackageClientResponse> {
    const requestedPackage = request.parsedDependency.package;
    const semverSpec = VersionUtils.parseSemver(requestedPackage.version);
    const { repositories } = request.clientData;
    const repoUrls = repositories.map(x => x.url);

    try {
      return await this.createRemotePackageDocument(repoUrls, request, semverSpec);
    } catch (error) {
      const errorResponse = error as HttpClientResponse;

      this.logger.debug(
        "Caught exception from {packageSource}: {error}",
        PackageSourceType.Registry,
        errorResponse
      );

      const suggestion = PackageStatusFactory.createFromHttpStatus(errorResponse.status);
      if (suggestion != null) {
        return ClientResponseFactory.create(
          PackageSourceType.Registry,
          errorResponse,
          [suggestion]
        )
      }

      throw errorResponse;
    }
  }

  async createRemotePackageDocument(
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