import type { CachingOptions } from '#domain/caching';
import type { HttpOptions, IJsonHttpClient, JsonClientResponse } from '#domain/clients';
import type { CargoClient, CargoConfig, CratesClient } from "#domain/providers/cargo";
import { nameOf } from '#domain/utils';

export enum CargoFeatures {
  Caching = 'cargo.caching',
  Http = 'cargo.http',
  DependencyProperties = 'cargo.dependencyProperties',
  ApiUrl = 'cargo.apiUrl',
  FilePatterns = 'cargo.files',
  OnSaveChangesTask = 'cargo.onSaveChanges',
  PrereleaseTagFilter = 'cargo.prereleaseTagFilter',
}

export interface ICargoServices {
  cargoCachingOpts: CachingOptions
  cargoHttpOpts: HttpOptions
  cargoConfig: CargoConfig
  cargoJsonClient: IJsonHttpClient
  cratesClient: CratesClient
  cargoClient: CargoClient
}

export const CargoService = nameOf<ICargoServices>()

export type CratesPackageVersionEntry = {
  num: string,
  yanked: boolean
}

export type CratesPackageVersionsResult = {
  versions: CratesPackageVersionEntry[]
}

export type CratesPackageVersionsResponse = JsonClientResponse<CratesPackageVersionsResult>