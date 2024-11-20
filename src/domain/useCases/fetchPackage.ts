import type { ILogger } from '#domain/logging';
import {
  type IPackageClient,
  type PackageResponse,
  type TPackageClientRequest,
  type TPackageClientResponse,
  PackageCache,
  ResponseFactory,
  getProjectVersionSuggestions
} from '#domain/packages';
import { PackageDescriptorType } from '#domain/parsers';
import type { ISuggestionProvider } from '#domain/providers';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class FetchPackage {

  constructor(
    private readonly packageCache: PackageCache,
    private readonly logger: ILogger
  ) {
    throwUndefinedOrNull("packageCache", packageCache);
    throwUndefinedOrNull("logger", logger);
  }

  async execute(
    provider: ISuggestionProvider,
    request: TPackageClientRequest<any>
  ): Promise<Array<PackageResponse>> {
    const providerName = provider.name;
    const parsedDependency = request.parsedDependency;
    const requestedPackage = parsedDependency.package;

    // capture start time
    const startedAt = performance.now();

    // check if this is a project version dep
    if (parsedDependency.descriptors.hasType(PackageDescriptorType.projectVersion)) {
      return getProjectVersionSuggestions(parsedDependency.package.version)
        .map(
          suggestion => ResponseFactory.createProjectVersionPackageResponse(
            providerName, request, suggestion
          )
        );
    }

    // get the package from the client or the cache
    let source = "cache";
    const response = await this.packageCache.getOrCreate(
      providerName,
      requestedPackage,
      async () => {
        source = "client";
        return await this.fetchFromClient(provider.client, request);
      },
      provider.config.caching.duration
    );

    // report completed duration
    const completedAt = performance.now();
    this.logger.info(
      'fetched from %s %s@%s (%s ms)',
      source,
      requestedPackage.name,
      requestedPackage.version,
      Math.floor(completedAt - startedAt)
    );

    return ResponseFactory.createSuccess(
      providerName,
      request,
      response
    );
  }

  async fetchFromClient(
    client: IPackageClient<any>,
    request: TPackageClientRequest<any>
  ): Promise<TPackageClientResponse> {

    const requestedPackage = request.parsedDependency.package;

    this.logger.silly("fetching %s", requestedPackage.name);

    let response: TPackageClientResponse;
    try {

      // fetch the package
      response = await client.fetchPackage(request);

    } catch (error) {
      // unexpected error
      this.logger.error(
        `%s caught an exception.\n Package: %j\n Error: %j`,
        this.fetchFromClient.name,
        requestedPackage,
        error
      );

      throw error;
    }

    // client handled error responses
    if (response.responseStatus?.rejected) {
      this.logger.error(
        "%s@%s was rejected with the status code %s",
        requestedPackage.name,
        requestedPackage.version,
        response.responseStatus.status
      );
    }

    return response;
  }

}