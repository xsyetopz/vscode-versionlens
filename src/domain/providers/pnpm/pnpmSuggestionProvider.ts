import type { ILogger } from '#domain/logging';
import {
  type PackageClientRequest,
  type PackageClientResponse,
  createPackageResource,
  PackageDependency
} from '#domain/packages';
import {
  type PackageNameDescriptor,
  type PackageVersionDescriptor,
  type YamlParserOptions,
  createVersionDescFromYamlNode,
  PackageDescriptorType,
  parsePackagesYaml
} from '#domain/parsers';
import type { ISuggestionProvider } from '#domain/providers';
import {
  type NpmClientData,
  type NpmSuggestionProvider,
  npmReplaceVersion
} from '#domain/providers/npm';
import type { PnpmConfig } from '#domain/providers/pnpm';
import { throwUndefinedOrNull } from '@esm-test/guards';

const yamlComplexTypeHandlers = {
  [PackageDescriptorType.version]: createVersionDescFromYamlNode
}

export class PnpmSuggestionProvider implements ISuggestionProvider {

  readonly name: string = 'pnpm';

  constructor(
    readonly config: PnpmConfig,
    readonly npmSuggestionProvider: NpmSuggestionProvider,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("npmSuggestionProvider", npmSuggestionProvider);
    throwUndefinedOrNull("logger", logger);
  }

  suggestionReplaceFn = npmReplaceVersion;

  parseDependencies(packagePath: string, packageText: string): Array<PackageDependency> {
    const options: YamlParserOptions = {
      includePropNames: this.config.dependencyProperties,
      complexTypeHandlers: yamlComplexTypeHandlers
    };

    const parsedPackages = parsePackagesYaml(packageText, options);

    const packageDependencies = [];

    for (const descriptors of parsedPackages) {
      const nameDesc = descriptors.getType<PackageNameDescriptor>(
        PackageDescriptorType.name
      );

      // map the version descriptor to a package dependency
      if (descriptors.hasType(PackageDescriptorType.version)) {
        const versionType = descriptors.getType<PackageVersionDescriptor>(
          PackageDescriptorType.version
        );

        packageDependencies.push(
          new PackageDependency(
            createPackageResource(
              nameDesc.name,
              versionType.version,
              packagePath
            ),
            descriptors
          )
        );

        //   continue;
      }

    } // end map loop

    return packageDependencies;
  }

  preFetchSuggestions(projectPath: string, packagePath: string): Promise<any> {
    return this.npmSuggestionProvider.preFetchSuggestions(projectPath, packagePath);
  }

  fetchSuggestions(request: PackageClientRequest<NpmClientData>): Promise<PackageClientResponse> {
    return this.npmSuggestionProvider.fetchSuggestions(request);
  }

}