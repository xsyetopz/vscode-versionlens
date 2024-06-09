import {
  PackageResponse,
  TPackageClientRequest,
  TPackageClientResponse,
  TPackageSuggestion
} from "domain/packages";

export function createSuccess<TClientData>(
  providerName: string,
  request: TPackageClientRequest<TClientData>,
  response: TPackageClientResponse
): Array<PackageResponse> {
  // map the documents to responses
  return response.suggestions.map(
    function (suggestion: TPackageSuggestion, order: number): PackageResponse {
      return {
        providerName,
        parsedDependency: request.parsedDependency,
        fetchedPackage: response.resolved,
        packageSource: response.source,
        type: response.type,
        suggestion,
        order,
      };
    }
  );
}