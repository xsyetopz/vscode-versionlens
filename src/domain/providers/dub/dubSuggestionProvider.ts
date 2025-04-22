import type { ILogger } from '#domain/logging';
import { PackageDependency, createPackageResource } from '#domain/packages';
import {
  type PackageNameDescriptor,
  type PackageVersionDescriptor,
  type JsonParserOptions,
  type JsonPackageTypeHandler,
  PackageDescriptorType,
  createPathDescFromJsonNode,
  createRepoDescFromJsonNode,
  createVersionDescFromJsonNode,
  parsePackagesJson,
} from '#domain/parsers';
import type { ISuggestionProvider } from '#domain/providers';
import type { DubClient, DubConfig } from '#domain/providers/dub';
import type { KeyDictionary } from '#domain/utils';
import { throwUndefinedOrNull } from '@esm-test/guards';

const complexTypeHandlers: KeyDictionary<JsonPackageTypeHandler> = {
  [PackageDescriptorType.version]: createVersionDescFromJsonNode,
  [PackageDescriptorType.path]: createPathDescFromJsonNode,
  "repository": createRepoDescFromJsonNode
};

export class DubSuggestionProvider implements ISuggestionProvider {

  readonly name: string = 'dub';

  constructor(
    readonly client: DubClient,
    readonly config: DubConfig,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("client", client);
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("logger", logger);
  }

  parseDependencies(packagePath: string, packageText: string): Array<PackageDependency> {
    const options: JsonParserOptions = {
      includePropNames: this.config.dependencyProperties,
      complexTypeHandlers
    };

    const parsedPackages = parsePackagesJson(packageText, options);

    const packageDependencies = [];

    for (const descriptors of parsedPackages) {

      // map the version descriptor to a package dependency
      if (descriptors.hasType(PackageDescriptorType.version)) {
        const nameDesc = descriptors.getType<PackageNameDescriptor>(
          PackageDescriptorType.name
        );

        const versionDesc = descriptors.getType<PackageVersionDescriptor>(
          PackageDescriptorType.version
        );

        packageDependencies.push(
          new PackageDependency(
            createPackageResource(
              nameDesc.name,
              versionDesc.version,
              packagePath
            ),
            descriptors
          )
        );

        continue;
      }

    }

    return packageDependencies;
  }

}