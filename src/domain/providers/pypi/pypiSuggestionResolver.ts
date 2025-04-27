import type { ILogger } from '#domain/logging';
import {
  type PackageClientRequest,
  type PackageClientResponse,
  type PackageDependency,
  type SemverSpec,
  ClientResponseFactory,
  PackageSourceType,
  VersionUtils,
  createSuggestions
} from '#domain/packages';
import type { PackagePathDescriptor } from '#domain/parsers';
import { PypiConfig, PypiHttpClient } from '#domain/providers/pypi';
import { throwUndefinedOrNull } from '@esm-test/guards';
import { coerce } from 'semver';

export class PypiSuggestionResolver {

  constructor(
    readonly config: PypiConfig,
    readonly pypiHttpClient: PypiHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("pypiHttpClient", pypiHttpClient);
    throwUndefinedOrNull("logger", logger);
  }

  fromPath(dependency: PackageDependency, pathDesc: PackagePathDescriptor): Promise<PackageClientResponse> {
    return ClientResponseFactory.createDirectory(
      dependency.package.name,
      dependency.package.path,
      pathDesc.path
    );
  }

  fromGit(): PackageClientResponse {
    return ClientResponseFactory.createGit();
  }

  async fromPypiApi(
    request: PackageClientRequest<null>,
    semverSpec: SemverSpec
  ): Promise<PackageClientResponse> {
    // fetch 
    const requestPackage = request.parsedDependency.package;
    const httpResponse = await this.pypiHttpClient.get(requestPackage.name);

    // process response
    const versionRange = semverSpec.rawVersion;
    const resolved = {
      name: requestPackage.name,
      version: versionRange,
    };

    // extract semver versions only
    const semverVersions = VersionUtils.filterSemverVersions(httpResponse.data)
      .map(x => coerce(x, VersionUtils.loosePrereleases).toString())
      .toSorted(VersionUtils.compareVersionsAndBuilds);

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
      responseStatus: ClientResponseFactory.mapStatusFromJsonResponse(httpResponse),
      type: semverSpec.type,
      resolved,
      suggestions,
    };
  }
}