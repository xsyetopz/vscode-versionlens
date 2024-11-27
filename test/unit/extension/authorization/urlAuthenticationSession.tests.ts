import type { ICache } from '#domain/caching';
import {
  type UrlAuthenticationSessionData,
  UrlAuthenticationSession
} from '#extension/authorization';
import assert from 'assert';
import { test } from 'mocha-ui-esm';
import { anything, instance, mock, verify, when } from 'ts-mockito';

type TestContext = {
  mockAuthCache: ICache
  testSession: UrlAuthenticationSession
}

export const UrlAuthenticationSessionTests = {

  [test.title]: UrlAuthenticationSession.name,

  beforeEach: function (this: TestContext) {
    this.mockAuthCache = mock<ICache>();
    this.testSession = new UrlAuthenticationSession(instance(this.mockAuthCache));
  },

  "ctor throws an error when '$2' param is $1": [
    ['authenticationCache', undefined],
    ['authenticationCache', null],
    function (testName: string, testValue: any) {
      try {
        new UrlAuthenticationSession(testValue);
        assert.ok(false)
      } catch (error) {
        if (!(error instanceof Error)) assert.fail()
        assert.ok(error.message.includes(testName))
      }
    }
  ],

  "updates consent $1": [
    ["when true", true],
    ["when false", false],
    function (this: TestContext, testTitle: string, testConsent: boolean) {
      const testUrl = 'http://anything';
      const testData: UrlAuthenticationSessionData = { consent: null, retries: 0 };
      when(this.mockAuthCache.get(testUrl)).thenReturn(testData);

      // test
      this.testSession.updateConsent(testUrl, testConsent);

      // verify
      verify(this.mockAuthCache.get<UrlAuthenticationSessionData>(testUrl)).once();

      // assert
      assert.equal(testData.consent, testConsent);
    }
  ],

  "increments retries": function (this: TestContext) {
    const testUrl = 'http://anything';
    const testData: UrlAuthenticationSessionData = { consent: true, retries: 0 };
    when(this.mockAuthCache.get(testUrl)).thenReturn(testData);

    // test
    this.testSession.incrementRetries(testUrl);

    // verify
    verify(this.mockAuthCache.get<UrlAuthenticationSessionData>(testUrl)).once();

    // assert
    assert.equal(testData.retries, 1);
  },

  "case $i: evaluates retry available": [
    [<UrlAuthenticationSessionData>{ consent: true, retries: 0 }, true],
    [<UrlAuthenticationSessionData>{ consent: false, retries: 0 }, false],
    [<UrlAuthenticationSessionData>{ consent: true, retries: 1 }, false],
    [<UrlAuthenticationSessionData>{ consent: false, retries: 1 }, false],
    async function (this: TestContext, testData: UrlAuthenticationSessionData, expected: boolean) {
      const testUrl = 'http://anything';
      when(this.mockAuthCache.getOrCreate(testUrl, anything())).thenResolve(testData);

      // test
      const actual = await this.testSession.hasRetries(testUrl);

      // verify
      verify(this.mockAuthCache.getOrCreate<UrlAuthenticationSessionData>(testUrl, anything())).once();

      // assert
      assert.equal(actual, expected);
    }
  ],

  "clears url data": function (this: TestContext) {
    const testUrl = 'http://anything';

    // test
    this.testSession.clear(testUrl);

    // verify
    verify(this.mockAuthCache.remove(testUrl)).once();
  },

}