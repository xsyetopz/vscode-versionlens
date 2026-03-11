import {
  type OsvClientResponse,
  OsvClient
} from '#domain/clients';
import type { ILogger } from '#domain/logging';
import type { PackageResponse } from '#domain/packages';
import type { PackageVulnerabilityResponse } from '#domain/useCases';
import { throwUndefinedOrNull } from '@esm-test/guards';

const providerToOsvEcosystem: Record<string, string> = {
  npm: 'npm',
  pnpm: 'npm',
  deno: 'npm',
  cargo: 'crates.io',
  pypi: 'PyPI',
  composer: 'Packagist',
  dotnet: 'NuGet',
  pub: 'Pub',
  maven: 'Maven',
  golang: 'Go',
  ruby: 'RubyGems',
};

/**
 * Use case for getting vulnerabilities for a package.
 */
export class GetVulnerabilities {

  /**
   * Initializes a new instance of the GetVulnerabilities class.
   * @param osvClient The OSV client.
   * @param logger The logger to use.
   */
  constructor(
    private readonly osvClient: OsvClient,
    private readonly logger: ILogger
  ) {
    throwUndefinedOrNull("osvClient", osvClient);
    throwUndefinedOrNull("logger", logger);
  }

  /**
   * Executes the get vulnerabilities use case.
   * @param packageResponse The package response.
   * @returns A promise resolving to the vulnerabilities and the range.
   */
  async execute(packageResponse: PackageResponse): Promise<PackageVulnerabilityResponse> {
    const dependency = packageResponse.parsedDependency;
    const response: PackageVulnerabilityResponse = { vulnerabilities: [] };

    const ecosystem = providerToOsvEcosystem[packageResponse.providerName];
    if (!ecosystem) {
      this.logger.trace(
        "No OSV ecosystem mapping found for provider: {providerName}",
        packageResponse.providerName
      );
      return response;
    }

    try {
      const version = stripRangeOperators(
        packageResponse.fetchedPackage?.version ?? dependency.package.version
      );

      const osvResponse: OsvClientResponse = await this.osvClient.query(
        dependency.package.name,
        ecosystem,
        version
      );

      response.vulnerabilities = osvResponse.data.map(v => ({
        id: v.id,
        range: dependency.versionRange,
        msg: `Vulnerability found in ${dependency.package.name}@${version}:\n${v.id}: ${v.summary || 'No summary available'}`,
        url: `https://osv.dev/vulnerability/${v.id}`
      }));

      return response;
    } catch (error) {
      this.logger.error(
        "Failed to fetch vulnerabilities for {packageName}@{packageVersion} in {ecosystem}: {error}",
        dependency.package.name,
        dependency.package.version,
        ecosystem,
        error
      );
      return response;
    }
  }

}

const versionRegex = /\d+(?:\.\d+)*(?:[a-zA-Z-][\da-zA-Z-]*)?(?:\+[\da-zA-Z-]*)?/;
function stripRangeOperators(version: string): string {
  const match = version.match(versionRegex);
  return match ? match[0] : version;
}