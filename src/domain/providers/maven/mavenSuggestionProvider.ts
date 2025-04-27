import type { ILogger } from '#domain/logging';
import {
  type PackageClientRequest,
  type PackageClientResponse,
  createPackageResource,
  PackageDependency,
  VersionUtils
} from '#domain/packages';
import {
  type PackageNameDescriptor,
  type PackageVersionDescriptor,
  PackageDescriptorType
} from '#domain/parsers';
import type { ISuggestionProvider } from '#domain/providers';
import {
  type MavenClientData,
  type MavenConfig,
  type MavenSuggestionResolver,
  type MvnCli,
  parseMavenPackagesXml
} from '#domain/providers/maven';
import { RegistryProtocols } from '#domain/utils';
import { throwUndefinedOrNull } from '@esm-test/guards';

export class MavenSuggestionProvider implements ISuggestionProvider {

  readonly name: string = 'maven';

  constructor(
    readonly resolver: MavenSuggestionResolver,
    readonly mvnCli: MvnCli,
    readonly config: MavenConfig,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull('resolver', resolver);
    throwUndefinedOrNull('mvnCli', mvnCli);
    throwUndefinedOrNull('config', config);
    throwUndefinedOrNull('logger', logger);
  }

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {
    const parsedPackages = parseMavenPackagesXml(
      packageText,
      this.config.dependencyProperties
    );

    const packageDependencies = parsedPackages
      .filter(x => x.hasType(PackageDescriptorType.version))
      .map(
        descriptors => {
          const nameDesc = descriptors.getType<PackageNameDescriptor>(
            PackageDescriptorType.name
          );

          const versionDesc = descriptors.getType<PackageVersionDescriptor>(
            PackageDescriptorType.version
          );

          return new PackageDependency(
            createPackageResource(
              nameDesc.name,
              versionDesc.version,
              packagePath
            ),
            descriptors
          )
        }
      );

    return packageDependencies;
  }

  async preFetchSuggestions(projectPath: string, packagePath: string): Promise<MavenClientData> {
    // gets source feeds from the project path
    const repos = await this.mvnCli.fetchRepositories(packagePath);

    // filter https urls
    const repositories = repos.filter(
      repo => repo.protocol === RegistryProtocols.https
    );

    // return the client data
    return { repositories };
  }

  async fetchSuggestions(request: PackageClientRequest<any>): Promise<PackageClientResponse> {
    const requestedPackage = request.parsedDependency.package;
    const semverSpec = VersionUtils.parseSemver(requestedPackage.version);
    const { repositories } = request.clientData;
    const repoUrls = repositories.map(x => x.url);
    return await this.resolver.fromMavenApi(repoUrls, request, semverSpec);
  }

}