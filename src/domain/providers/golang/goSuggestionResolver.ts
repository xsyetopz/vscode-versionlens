import type { ILogger } from '#domain/logging';
import {
  type PackageClientRequest,
  type PackageClientResponse,
  type SemverSpec,
  ClientResponseFactory,
  PackageDependency,
  PackageSourceType,
  VersionUtils,
  createSuggestions
} from '#domain/packages';
import type { PackagePathDescriptor } from '#domain/parsers';
import type { GoConfig, GoHttpClient } from '#domain/providers/golang';
import { throwUndefinedOrNull } from '@esm-test/guards';
import { coerce, compareLoose } from 'semver';

export class GoSuggestionResolver {

  constructor(
    readonly config: GoConfig,
    readonly goHttpClient: GoHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('goHttpClient', goHttpClient);
    throwUndefinedOrNull('logger', logger);
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

  async fromGoApi<TClientData>(
    request: PackageClientRequest<TClientData>,
    semverSpec: SemverSpec
  ): Promise<PackageClientResponse> {
    // fetch
    const requestPackage = request.parsedDependency.package;
    const httpResponse = await this.goHttpClient.get(requestPackage.name);

    // process response
    const { data } = httpResponse;
    const versionRange = semverSpec.rawVersion;

    const resolved = {
      name: requestPackage.name,
      version: versionRange,
    };

    const responseStatus = {
      source: httpResponse.source,
      status: httpResponse.status,
    };

    // sort versions
    const rawVersions = data.versions.toSorted(VersionUtils.compareVersionsAndBuilds)

    // extract semver versions only
    const semverVersions = VersionUtils.filterSemverVersions(rawVersions)
      .map(x => coerce(x, VersionUtils.loosePrereleases).toString());

    // seperate versions to releases and prereleases
    const { releases, prereleases } = VersionUtils.splitReleasesFromArray(
      semverVersions.sort(compareLoose),
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