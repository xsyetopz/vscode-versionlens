import type { HttpClientResponse, IHttpClient } from '#domain/clients';
import type { ILogger } from '#domain/logging';
import { type MavenApiResponse, getVersionsFromPackageXml } from '#domain/providers/maven';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class MavenHttpClient {

  constructor(
    readonly httpClient: IHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull('httpClient', httpClient);
    throwUndefinedOrNull('logger', logger);
  }

  async get(packageName: string, [repoUrl, ...fallbacks]: string[]): Promise<MavenApiResponse> {
    const [group, artifact] = packageName.split(':');
    const search = group.replaceAll('.', '/') + '/' + artifact
    const url = `${repoUrl}${search}/maven-metadata.xml`;

    try {
      const httpResponse = await this.httpClient.get(url);

      // reduce the dataset
      const data = getVersionsFromPackageXml(httpResponse.data);

      // return the response
      return { ...httpResponse, data };
    } catch (error) {
      const errorResponse = error as HttpClientResponse;

      this.logger.debug(
        "request failed for '{packageName}' from '{resourceUrl}': {error}",
        packageName,
        new URL(url),
        errorResponse
      );

      // retry if 404 and we have more urls to try
      if (errorResponse.status === 404 && fallbacks.length > 0) {
        this.logger.debug(
          "attempting to fetch '{packageName}' from '{url}'",
          packageName,
          new URL(url)
        );
        return this.get(packageName, fallbacks);
      }

      throw error;
    }

  }

}