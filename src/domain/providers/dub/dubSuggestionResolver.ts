import type { ILogger } from '#domain/logging';
import {
  type PackageClientRequest,
  type PackageClientResponse,
  type PackageSuggestion,
  type SemverSpec,
  ClientResponseFactory,
  PackageSourceType,
  PackageStatusFactory,
  VersionUtils,
  createSuggestions
} from '#domain/packages';
import type { DubConfig, DubJsonClient } from '#domain/providers/dub';
import { throwUndefinedOrNull } from '@esm-test/guards';
import { valid } from 'semver';

export class DubSuggestionResolver {

  constructor(
    readonly config: DubConfig,
    readonly dubJsonClient: DubJsonClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('dubJsonClient', dubJsonClient);
    throwUndefinedOrNull('logger', logger);
  }

  async fromDubApi(
    request: PackageClientRequest<null>,
    semverSpec: SemverSpec
  ): Promise<PackageClientResponse> {
    const requestedPackage = request.parsedDependency.package;
    const jsonResponse = await this.dubJsonClient.get(requestedPackage.name);

    // process response
    const versionRange = semverSpec.rawVersion;

    const resolved = {
      name: requestedPackage.name,
      version: versionRange,
    };

    // seperate versions to releases and prereleases
    const { releases, prereleases } = VersionUtils.splitReleasesFromArray(
      jsonResponse.data,
      this.config.prereleaseTagFilter
    );

    // analyse suggestions
    const suggestions = parseSuggestions(
      versionRange,
      releases,
      prereleases
    );

    return {
      source: PackageSourceType.Registry,
      responseStatus: ClientResponseFactory.mapStatusFromJsonResponse(jsonResponse),
      type: semverSpec.type,
      resolved,
      suggestions,
    };
  }

}

function parseSuggestions(
  versionRange: string,
  releases: string[],
  prereleases: string[]
): Array<PackageSuggestion> {
  if (releases.length === 0) {
    return [PackageStatusFactory.createNoMatchStatus()]
  }

  const latestRelease = releases[releases.length - 1];
  const isValid = valid(versionRange.replace('~>', ''));

  // checks if this is a repo version
  if (!isValid && versionRange.startsWith('~') && latestRelease === versionRange) {
    return [PackageStatusFactory.createMatchesLatestStatus(versionRange)]
  }

  return createSuggestions(
    versionRange,
    releases,
    prereleases
  );
}