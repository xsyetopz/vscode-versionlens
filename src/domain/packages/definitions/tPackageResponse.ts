import { PackageDependency, TPackageSuggestion } from 'domain/packages';
import { PackageSourceType } from '../clients/ePackageSource';
import { PackageVersionType } from '../definitions/ePackageVersionType';
import { TPackageNameVersion } from '../definitions/tPackageNameVersion';

export type PackageResponse = {
  providerName: string;
  parsedDependency: PackageDependency,
  fetchedPackage?: TPackageNameVersion;
  packageSource?: PackageSourceType;
  type?: PackageVersionType;
  suggestion?: TPackageSuggestion;
  order: number;
};