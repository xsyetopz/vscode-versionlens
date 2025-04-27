import type { ILogger } from '#domain/logging';
import {
  type PackageClientRequest,
  type PackageClientResponse,
  type PackageDependency,
  ClientResponseFactory
} from '#domain/packages';
import type { ISuggestionProvider } from '#domain/providers';
import type { DenoConfig, DenoSuggestionResolver } from '#domain/providers/deno';
import {
  type NpaSpec,
  type NpmClientData,
  type NpmSuggestionProvider,
  npmReplaceVersion
} from '#domain/providers/npm';
import { throwUndefinedOrNull } from '@esm-test/guards';
import npa from 'npm-package-arg';

export class DenoSuggestionProvider implements ISuggestionProvider {

  readonly name: string = 'deno';

  constructor(
    readonly resolver: DenoSuggestionResolver,
    readonly config: DenoConfig,
    readonly npmSuggestionProvider: NpmSuggestionProvider,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("client", resolver);
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("npmSuggestionProvider", npmSuggestionProvider);
    throwUndefinedOrNull("logger", logger);
  }

  suggestionReplaceFn = npmReplaceVersion;

  parseDependencies(packagePath: string, packageText: string): Array<PackageDependency> {
    return this.npmSuggestionProvider.parseDependencies(
      packagePath,
      packageText,
      this.config.dependencyProperties
    );
  }

  preFetchSuggestions(projectPath: string, packagePath: string): Promise<any> {
    return this.npmSuggestionProvider.preFetchSuggestions(projectPath, packagePath);
  }

  async fetchSuggestions(request: PackageClientRequest<NpmClientData>): Promise<PackageClientResponse> {
    const requestedPackage = request.parsedDependency.package;
    const isDenoJsr = requestedPackage.version.startsWith('jsr:');
    const isDenoNpm = requestedPackage.version.startsWith('npm:');

    // no suggestions?
    if (!isDenoJsr && !isDenoNpm) return ClientResponseFactory.createNoSuggestions();

    const npaSpec = npa.resolve(
      requestedPackage.name,
      requestedPackage.version.replaceAll('jsr:', 'npm:'),
      requestedPackage.path
    ) as NpaSpec;

    return isDenoNpm
      ? this.resolver.fromNpm(request, npaSpec)
      : this.resolver.fromJsr(npaSpec);
  }

}