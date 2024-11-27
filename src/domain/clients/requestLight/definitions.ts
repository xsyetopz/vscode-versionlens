import { XHROptions } from 'request-light';

export interface IXhrResponse {
  responseText: string;
  status: number;
  headers: any;
}

export interface IXhrRequest {
  xhr: (options: XHROptions) => Promise<IXhrResponse>;
}