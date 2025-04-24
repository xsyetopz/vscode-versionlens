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
  createSuggestions,
} from '#domain/packages';
import {
  type PackageGitDescriptor,
  type PackagePathDescriptor,
  PackageDescriptorType,
} from '#domain/parsers';
import { GoConfig, GoHttpClient } from '#domain/providers/golang';
import { throwUndefinedOrNull } from '@esm-test/guards';
import { coerce, compareLoose } from 'semver';

export class GoClient implements IPackageClient<null> {

  constructor(
    readonly config: GoConfig,
    readonly goHttpClient: GoHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("goApiClient", goHttpClient);
    throwUndefinedOrNull("logger", logger);
  }

  async fetchPackage<TClientData>(
    request: PackageClientRequest<TClientData>
  ): Promise<PackageClientResponse> {
    const requestedPackage = request.parsedDependency.package;

    // return a directory response if this a path type
    const pathDesc = request.parsedDependency.descriptors.getType<PackagePathDescriptor>(
      PackageDescriptorType.path
    );
    if (pathDesc) {
      return await ClientResponseFactory.createDirectory(
        requestedPackage.name,
        requestedPackage.path,
        pathDesc.path
      );
    }

    // return a git response if this a git type
    const gitDesc = request.parsedDependency.descriptors.getType<PackageGitDescriptor>(
      PackageDescriptorType.git
    );
    if (gitDesc) return ClientResponseFactory.createGit();

    try {
      const semverSpec = VersionUtils.parseSemver(requestedPackage.version);
      semverSpec.rawVersion = semverSpec.rawVersion.replace('+incompatible', '')
      return await this.createRemotePackageDocument(request, semverSpec)
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

  async createRemotePackageDocument<TClientData>(
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