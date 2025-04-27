import type { ILogger } from '#domain/logging';
import {
  type PackageClientRequest,
  type PackageClientResponse,
  ClientResponseFactory,
  createSuggestions,
  PackageSourceType,
  PackageVersionType,
  VersionUtils
} from '#domain/packages';
import type { DenoConfig, JsrClient } from '#domain/providers/deno';
import type { NpaSpec, NpmClientData, NpmSuggestionResolver } from '#domain/providers/npm';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class DenoSuggestionResolver {

  constructor(
    readonly config: DenoConfig,
    readonly jsrClient: JsrClient,
    readonly npmSuggestionResolver: NpmSuggestionResolver,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('jsrClient', jsrClient);
    throwUndefinedOrNull('npmSuggestionResolver', npmSuggestionResolver);
    throwUndefinedOrNull('logger', logger);
  }

  async fromNpm(request: PackageClientRequest<NpmClientData>, npaSpec: NpaSpec) {
    return this.npmSuggestionResolver.fromRegistry(request, npaSpec);
  }

  async fromJsr(npaSpec: NpaSpec): Promise<PackageClientResponse> {
    // fetch
    const jsonResponse = await this.jsrClient.get(npaSpec.subSpec.name);

    // process response
    const versionRange = npaSpec.subSpec.rawSpec;
    const resolved = {
      name: npaSpec.subSpec.name,
      version: versionRange,
    };

    // sort versions
    const rawVersions = jsonResponse.data.toSorted(VersionUtils.compareVersionsAndBuilds);

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
      responseStatus: ClientResponseFactory.mapStatusFromJsonResponse(jsonResponse),
      type: PackageVersionType.Alias,
      resolved,
      suggestions,
    };
  }

}