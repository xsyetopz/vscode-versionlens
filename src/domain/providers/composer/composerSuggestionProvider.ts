import type { ILogger } from '#domain/logging';
import { PackageDependency, createPackageResource } from '#domain/packages';
import {
  type JsonPackageTypeHandler,
  type JsonParserOptions,
  type PackageNameDescriptor,
  type PackageVersionDescriptor,
  PackageDescriptorType,
  createVersionDescFromJsonNode,
  parsePackagesJson,
} from '#domain/parsers';
import type { ISuggestionProvider } from '#domain/providers';
import {
  ComposerClient,
  ComposerConfig,
  customDescriptorHandler
} from '#domain/providers/composer';
import type { KeyDictionary } from '#domain/utils';
import { throwUndefinedOrNull } from '@esm-test/guards';

const complexTypeHandlers: KeyDictionary<JsonPackageTypeHandler> = {
  [PackageDescriptorType.version]: createVersionDescFromJsonNode
};

export class ComposerSuggestionProvider implements ISuggestionProvider {

  readonly name: string = 'composer';

  constructor(
    readonly client: ComposerClient,
    readonly config: ComposerConfig,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("client", client);
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("logger", logger);
  }

  parseDependencies(packagePath: string, packageText: string): Array<PackageDependency> {
    const options: JsonParserOptions = {
      includePropNames: this.config.dependencyProperties,
      customDescriptorHandler,
      complexTypeHandlers
    };

    const parsedPackages = parsePackagesJson(packageText, options);

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

}