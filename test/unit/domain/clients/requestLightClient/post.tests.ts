import type { IAuthorizer } from '#domain/authorization';
import type { CachingOptions } from '#domain/caching';
import {
  type HttpClientResponse,
  type HttpOptions,
  ClientResponseSource,
  HttpClientRequestMethods
} from '#domain/clients';
import {
  type IXhrRequest,
  type IXhrResponse,
  httpClientDefaultHeaders,
  RequestLightClient
} from '#domain/clients/requestLight';
import { type KeyStringDictionary, createUrl } from '#domain/utils';
import { test } from '@esm-test/esm-test-node';
import assert from 'node:assert';
import type { XHROptions } from 'request-light';
import { anything, capture, deepEqual, instance, mock, verify, when } from 'ts-mockito';

type TestContext = {
  mockAuthorizer: IAuthorizer
  mockCachingOpts: CachingOptions
  mockHttpOpts: HttpOptions
  mockRequestLight: IXhrRequest,
  testRequestOpts: XHROptions,
  rut: RequestLightClient
}

export const RequestLightClientPostTests = {

  [test.title]: `${RequestLightClient.name} (POST)`,

  beforeEach: function (this: TestContext) {
    this.mockAuthorizer = mock<IAuthorizer>();
    this.mockCachingOpts = mock<CachingOptions>();
    this.mockHttpOpts = mock<HttpOptions>();
    this.mockRequestLight = mock<IXhrRequest>();

    when(this.mockRequestLight.xhr(anything())).thenResolve({
      status: 0,
      headers: { ...httpClientDefaultHeaders },
      responseText: ''
    });

    // default options
    when(this.mockCachingOpts.duration).thenReturn(30000);
    when(this.mockHttpOpts.strictSSL).thenReturn(true);

    // request under test
    this.rut = new RequestLightClient(
      instance(this.mockRequestLight),
      instance(this.mockAuthorizer),
      instance(this.mockHttpOpts)
    );
  },

  "should set strictSSL to $1 in xhr options": [
    [true],
    [false],
    async function (this: TestContext, testStrictSSL: boolean) {
      when(this.mockRequestLight.xhr(anything()))
        .thenResolve({
          status: 200,
          headers: {},
          responseText: 'test response'
        });

      // set test options
      when(this.mockHttpOpts.strictSSL).thenReturn(testStrictSSL);

      const rut = new RequestLightClient(
        instance(this.mockRequestLight),
        instance(this.mockAuthorizer),
        instance(this.mockHttpOpts)
      );

      // test
      await rut.post('http://anywhere');

      // assert
      const [actualOpts] = capture(this.mockRequestLight.xhr).first();
      assert.equal(actualOpts.strictSSL, testStrictSSL);
    }
  ],

  "generates the expected url $1": [
    ["with no query params", {}],
    ["with query params", { param1: 1, param2: 2 }],
    async function (this: TestContext, testTitlePart: string, testQuery: KeyStringDictionary) {
      const testUrl = 'https://test.url.example/path';
      const expectedUrl = createUrl(testUrl, testQuery);

      // test
      await this.rut.post(testUrl, undefined, testQuery);

      // assert
      const [actualOpts] = capture(this.mockRequestLight.xhr).first();
      assert.equal(actualOpts.url, expectedUrl);
      assert.equal(actualOpts.type, HttpClientRequestMethods.post);
    }
  ],

  "sends the expected data": async function (this: TestContext) {
    const testUrl = 'https://test.url.example/path';
    const testData = 'test data';

    // test
    await this.rut.post(testUrl, testData);

    // assert
    const [actualOpts] = capture(this.mockRequestLight.xhr).first();
    assert.equal(actualOpts.data, testData);
  },

  "returns successful responses": async function (this: TestContext) {
    const testUrl = 'https://test.url.example/path';
    const testData = 'test data';
    const testXhrResponse = {
      source: ClientResponseSource.remote,
      status: 200,
      responseText: "success test",
    };
    const expectedResponse: HttpClientResponse = {
      source: ClientResponseSource.remote,
      status: testXhrResponse.status,
      data: testXhrResponse.responseText,
      rejected: false
    };

    when(this.mockRequestLight.xhr(anything()))
      .thenResolve({
        status: testXhrResponse.status,
        headers: {},
        responseText: testXhrResponse.responseText
      });

    // test
    const actual = await this.rut.post(testUrl, testData);

    // assert
    assert.deepEqual(actual, expectedResponse);
  },

  "returns rejected responses": async function (this: TestContext) {
    const testUrl = 'https://test.url.example/path';
    const testResponse = {
      status: 404,
      responseText: "not found",
      source: ClientResponseSource.remote
    };
    const testFailedResponse: IXhrResponse = {
      status: testResponse.status,
      headers: {},
      responseText: testResponse.responseText
    };
    const expectedResponse: HttpClientResponse = {
      status: testResponse.status,
      data: testResponse.responseText,
      source: ClientResponseSource.remote,
      rejected: true,
    };

    when(this.mockRequestLight.xhr(anything()))
      .thenReject(<any>testFailedResponse);

    // test
    try {
      await this.rut.post(testUrl);
      assert.ok(false);
    } catch (actual) {
      assert.deepEqual(actual, expectedResponse);
    }
  },

  "uses provided caller authorization headers": async function (this: TestContext) {
    const testHost = 'test.url.example';
    const testUrl = `https://${testHost}/path`;
    const testAuth = { Authorization: 'test provided token' };
    const testData = 'test data';
    const expectedOptions: XHROptions = {
      url: testUrl,
      type: HttpClientRequestMethods.post,
      headers: { ...testAuth, ...httpClientDefaultHeaders },
      data: testData,
      strictSSL: true
    };

    // test
    const actual = await this.rut.post(testUrl, testData, {}, testAuth);

    // verify
    verify(this.mockRequestLight.xhr(deepEqual(expectedOptions))).once();
    verify(this.mockAuthorizer.hasAuthorizationUrl(testHost)).never();

    // assert
    assert.ok(!!actual);
  },

  "$1 headers.Authorization when isUrlAuthorized() is '$2' and authToken is '$3'":
    [
      ['auto sets', true, 'test token'],
      ['does not set', true, undefined],
      ['does not set', false, undefined],
      async function (
        this: TestContext,
        testTitle: string,
        testIsUrlAuthorized: boolean,
        testToken: string
      ) {
        const testHost = 'https://test.url.example';
        const testUrl = `${testHost}/path`;
        const testData = 'test data';
        const expectedOptions: XHROptions = {
          url: testUrl,
          type: HttpClientRequestMethods.post,
          headers: httpClientDefaultHeaders,
          data: testData,
          strictSSL: true
        };

        if (testToken !== undefined) {
          expectedOptions.headers = {
            ...expectedOptions.headers,
            ...{
              Authorization: testToken,
            }
          }
        }

        // set options
        when(this.mockHttpOpts.strictSSL).thenReturn(true);

        // set auth
        when(this.mockAuthorizer.getAuthorizationUrl(testUrl)).thenReturn(testHost);
        when(this.mockAuthorizer.hasAuthorizationUrl(testHost))
          .thenReturn(testIsUrlAuthorized);

        when(this.mockAuthorizer.getToken(testHost)).thenResolve(testToken);

        // test
        const actual = await this.rut.post(testUrl, testData);

        // verify
        verify(this.mockAuthorizer.getAuthorizationUrl(testUrl)).once();
        verify(this.mockRequestLight.xhr(deepEqual(expectedOptions))).once();
        verify(this.mockAuthorizer.hasAuthorizationUrl(testHost)).once();
        verify(this.mockAuthorizer.retryCredentials(testHost)).never();
        verify(this.mockAuthorizer.getCredentials(testHost, testUrl)).never();

        // assert
        assert.ok(!!actual);
      }
    ],

  "does not retry to authorize when authorizer.getConsent() returns false":
    async function (this: TestContext) {
      const testHost = 'https://test.url.example';
      const testUrl = `${testHost}/path`;
      const testData = 'test data';
      const testRequest: XHROptions = {
        url: testUrl,
        type: HttpClientRequestMethods.post,
        headers: httpClientDefaultHeaders,
        data: testData,
        strictSSL: true
      };
      const testResponse: IXhrResponse = {
        status: 401,
        headers: {},
        responseText: 'not authorized'
      };

      when(this.mockAuthorizer.getAuthorizationUrl(testUrl)).thenReturn(testHost);
      when(this.mockRequestLight.xhr(deepEqual(testRequest))).thenReject(<any>testResponse);
      when(this.mockAuthorizer.getCredentials(testHost, testUrl)).thenResolve(false);

      try {
        // test
        await this.rut.post(testUrl, testData);
        assert.fail();
      } catch (error) {
        const actualResponse = error as HttpClientResponse;
        // assert
        assert.equal(actualResponse.status, 401);
        assert.equal(actualResponse.data, testResponse.responseText);
      }

      // verify
      verify(this.mockAuthorizer.getAuthorizationUrl(testUrl)).once();
      verify(this.mockAuthorizer.getToken(anything())).never();
      verify(this.mockRequestLight.xhr(deepEqual(testRequest))).once();
      verify(this.mockAuthorizer.getCredentials(testHost, testUrl)).once();
      verify(this.mockAuthorizer.retryCredentials(testHost)).never();
    },

  "retries to authorize when authorizer.getConsent() returns true":
    async function (this: TestContext) {
      let testRetries = 0;
      const testHost = 'https://test.url.example';
      const testUrl = `${testHost}/path`;
      const testToken = '12345678';
      const testData = 'test data';
      const testFirstRequest: XHROptions = {
        url: testUrl,
        type: HttpClientRequestMethods.post,
        headers: httpClientDefaultHeaders,
        data: testData,
        strictSSL: true
      };
      const testSecondRequest: XHROptions = {
        url: testUrl,
        type: HttpClientRequestMethods.post,
        headers: { ...httpClientDefaultHeaders, Authorization: testToken },
        data: testData,
        strictSSL: true
      };
      const testResponse: IXhrResponse = {
        status: 401,
        headers: {},
        responseText: 'not authorized'
      };

      when(this.mockAuthorizer.getAuthorizationUrl(testUrl)).thenReturn(testHost);

      // set state first time is called
      when(this.mockAuthorizer.hasAuthorizationUrl(testHost)).thenReturn(false);

      // first xhr time called
      when(this.mockRequestLight.xhr(deepEqual(testFirstRequest)))
        .thenCall(() => {
          testRetries++;
          when(this.mockAuthorizer.hasAuthorizationUrl(testHost)).thenReturn(true);
          when(this.mockAuthorizer.getToken(testHost)).thenResolve(testToken);
          when(this.mockAuthorizer.getCredentials(testHost, testUrl)).thenResolve(true);
          return Promise.reject(testResponse);
        });

      // second xhr time called
      when(this.mockRequestLight.xhr(deepEqual(testSecondRequest))).thenResolve({
        status: 200,
        responseText: 'success',
        headers: {}
      });

      try {
        // test
        const actual = await this.rut.post(testUrl, testData);
        // assert
        assert.equal(testRetries, 1);
        assert.equal(actual.status, 200);
        assert.equal(actual.data, 'success');
      } catch (error) {
        assert.fail();
      }

      // verify
      verify(this.mockAuthorizer.getAuthorizationUrl(testUrl)).twice();
      verify(this.mockAuthorizer.hasAuthorizationUrl(testHost)).twice();
      verify(this.mockAuthorizer.getToken(testHost)).once();
      verify(this.mockAuthorizer.getCredentials(testHost, testUrl)).once();
      verify(this.mockAuthorizer.retryCredentials(testHost)).never();
      verify(this.mockRequestLight.xhr(deepEqual(testFirstRequest))).once();
      verify(this.mockRequestLight.xhr(deepEqual(testSecondRequest))).once();
    },

  "does not retry to authorize when authorizer.retryCredentials() returns false":
    async function (this: TestContext) {
      const testHost = 'https://test.url.example';
      const testUrl = `${testHost}/path`;
      const testToken = '12345678';
      const testData = 'test data';
      const testRequest: XHROptions = {
        url: testUrl,
        type: HttpClientRequestMethods.post,
        headers: { ...httpClientDefaultHeaders, Authorization: testToken },
        data: testData,
        strictSSL: true
      };
      const testResponse: IXhrResponse = {
        status: 401,
        headers: {},
        responseText: 'not authorized'
      };

      when(this.mockAuthorizer.getAuthorizationUrl(testUrl)).thenReturn(testHost);
      when(this.mockAuthorizer.hasAuthorizationUrl(testHost)).thenReturn(true);
      when(this.mockAuthorizer.getToken(testHost)).thenResolve(testToken);
      when(this.mockRequestLight.xhr(deepEqual(testRequest))).thenReject(<any>testResponse);
      when(this.mockAuthorizer.retryCredentials(testHost)).thenResolve(false);

      try {
        // test
        await this.rut.post(testUrl, testData);
        assert.fail();
      } catch (error) {
        const actualResponse = error as HttpClientResponse;
        // assert
        assert.equal(actualResponse.status, 401);
        assert.equal(actualResponse.data, testResponse.responseText);
      }

      // verify
      verify(this.mockAuthorizer.getAuthorizationUrl(testUrl)).once();
      verify(this.mockAuthorizer.getToken(anything())).once();
      verify(this.mockRequestLight.xhr(deepEqual(testRequest))).once();
      verify(this.mockAuthorizer.retryCredentials(testHost)).once();
      verify(this.mockAuthorizer.getCredentials(testHost, testUrl)).never();
    },

  "retries to authorize when authorizer.retryCredentials() returns true":
    async function (this: TestContext) {
      let testRetries = 0;
      const testHost = 'https://test.url.example';
      const testUrl = `${testHost}/path`;
      const testFirstToken = '12345678';
      const testSecondToken = 'ABCDEFGH';
      const testData = 'test data';
      const testFirstRequest: XHROptions = {
        url: testUrl,
        type: HttpClientRequestMethods.post,
        headers: { ...httpClientDefaultHeaders, Authorization: testFirstToken },
        data: testData,
        strictSSL: true
      };
      const testSecondRequest: XHROptions = {
        url: testUrl,
        type: HttpClientRequestMethods.post,
        headers: { ...httpClientDefaultHeaders, Authorization: testSecondToken },
        data: testData,
        strictSSL: true
      };
      const testResponse: IXhrResponse = {
        status: 401,
        headers: {},
        responseText: 'not authorized'
      };

      when(this.mockAuthorizer.getAuthorizationUrl(testUrl)).thenReturn(testHost);
      when(this.mockAuthorizer.hasAuthorizationUrl(testHost)).thenReturn(true);
      when(this.mockAuthorizer.getToken(testHost)).thenResolve(testFirstToken);

      // first xhr time called
      when(this.mockRequestLight.xhr(deepEqual(testFirstRequest)))
        .thenCall(() => {
          testRetries++;
          when(this.mockAuthorizer.getToken(testHost)).thenResolve(testSecondToken);
          when(this.mockAuthorizer.retryCredentials(testHost)).thenResolve(true);
          return Promise.reject(testResponse);
        });

      // second xhr time called
      when(this.mockRequestLight.xhr(deepEqual(testSecondRequest))).thenResolve({
        status: 200,
        responseText: 'success',
        headers: {}
      });

      try {
        // test
        const actual = await this.rut.post(testUrl, testData);
        // assert
        assert.equal(testRetries, 1);
        assert.equal(actual.status, 200);
        assert.equal(actual.data, 'success');
      } catch (error) {
        assert.fail();
      }

      // verify
      verify(this.mockRequestLight.xhr(deepEqual(testFirstRequest))).once();
      verify(this.mockRequestLight.xhr(deepEqual(testSecondRequest))).once();
      verify(this.mockAuthorizer.getAuthorizationUrl(testUrl)).twice();
      verify(this.mockAuthorizer.hasAuthorizationUrl(testHost)).twice();
      verify(this.mockAuthorizer.getToken(testHost)).twice();
      verify(this.mockAuthorizer.retryCredentials(testHost)).once();
      verify(this.mockAuthorizer.getCredentials(testHost, testUrl)).never();
    },

  "when the fetch url starts with multi registry url then use multi registry url for auth lookup": async function (this: TestContext) {
    const testHost = 'https://test.url.example';
    const testUrl = `${testHost}/sub/user/project/registry/index.json`;
    const testMultiRegistryUrl = `${testHost}/sub/user/project/registry`;
    const testToken = '12345678';
    const testData = 'test data';
    const testRequest: XHROptions = {
      url: testUrl,
      type: HttpClientRequestMethods.post,
      headers: { ...httpClientDefaultHeaders, Authorization: testToken },
      data: testData,
      strictSSL: true
    };

    when(this.mockAuthorizer.getAuthorizationUrl(testUrl)).thenReturn(testMultiRegistryUrl);
    when(this.mockAuthorizer.hasAuthorizationUrl(testMultiRegistryUrl)).thenReturn(true);
    when(this.mockAuthorizer.getToken(testMultiRegistryUrl)).thenResolve(testToken);

    // test
    await this.rut.post(testUrl, testData);

    // verify
    verify(this.mockAuthorizer.getAuthorizationUrl(testUrl)).once();
    verify(this.mockAuthorizer.hasAuthorizationUrl(testMultiRegistryUrl)).once();
    verify(this.mockAuthorizer.getToken(testMultiRegistryUrl)).once();
    verify(this.mockRequestLight.xhr(deepEqual(testRequest))).once();
  }

};