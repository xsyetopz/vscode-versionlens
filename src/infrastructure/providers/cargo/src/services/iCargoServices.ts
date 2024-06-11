import { CachingOptions } from '#domain/caching';
import { IJsonHttpClient } from '#domain/clients';
import { HttpOptions } from '#domain/http';
import { CargoConfig, CratesClient } from "#providers/cargo";

export interface ICargoService {

  cargoCachingOpts: CachingOptions;

  cargoHttpOpts: HttpOptions;

  cargoConfig: CargoConfig;

  cargoJsonClient: IJsonHttpClient;

  cratesClient: CratesClient;

}