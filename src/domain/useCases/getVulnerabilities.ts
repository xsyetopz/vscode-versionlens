import {
  type OsvClientResponse,
  OsvClient
} from '#domain/clients';
import type { ILogger } from '#domain/logging';
import { PackageTextRange } from '#domain/parsers';
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
   * @param packageVersion Optional version to check for vulnerabilities.
   * @returns A promise resolving to the vulnerabilities and the range.
   */
  async execute(
    providerName: string,
    packageName: string,
    packageVersion: string,
    textRange: PackageTextRange
  ): Promise<PackageVulnerabilityResponse> {
    const response: PackageVulnerabilityResponse = { vulnerabilities: [] };

    const ecosystem = providerToOsvEcosystem[providerName];
    if (!ecosystem) {
      this.logger.trace(
        "No OSV ecosystem mapping found for provider: {providerName}",
        providerName
      );
      return response;
    }

    try {
      const version = stripRangeOperators(packageVersion);
      const osvResponse: OsvClientResponse = await this.osvClient.query(
        packageName,
        ecosystem,
        version
      );

      response.vulnerabilities = osvResponse.data.map(v => ({
        id: v.id,
        range: textRange,
        msg: `Vulnerability found in ${packageName}@${version}:\n${v.id}: ${v.summary || 'No summary available'}`,
        url: `https://osv.dev/vulnerability/${v.id}`
      }));

      return response;
    } catch (error) {
      this.logger.error(
        "Failed to fetch vulnerabilities for {packageName}@{packageVersion} in {ecosystem}: {error}",
        packageName,
        packageVersion,
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