import { IFrozenOptions } from '#domain/configuration';

export enum HttpFeatures {
  StrictSSL = 'strictSSL'
}

export interface IHttpOptions extends IFrozenOptions {

  config: IFrozenOptions;

  strictSSL: boolean;

}