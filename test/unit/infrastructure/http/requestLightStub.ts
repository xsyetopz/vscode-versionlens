import { IXhrResponse } from '#domain/http/requestLight';

export class RequestLightStub {
  xhr(opts: any): Promise<IXhrResponse> {
    return Promise.resolve({
      responseText: '',
      status: 0,
      headers: {}
    });
  }
}