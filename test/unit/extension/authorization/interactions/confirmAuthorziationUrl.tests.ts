import { AuthenticationInteractions, AuthPrompt } from '#extension/authorization';
import type { IVsCodeWindow } from '#extension/vscode';
import assert from 'assert';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import type { InputBoxOptions, MessageOptions } from 'vscode';

type TestContext = {
  mockWindow: IVsCodeWindow
  testInterations: AuthenticationInteractions
}

export const ConfirmAuthorziationUrlTests = {

  beforeEach: function (this: TestContext) {
    this.mockWindow = mock<IVsCodeWindow>();
    this.testInterations = new AuthenticationInteractions(instance(this.mockWindow));
  },

  "case $i: returns undefined when no auth url is not entered": [
    undefined,
    '',
    async function (this: TestContext, testInput: string | undefined) {
      const testAuthUrl = 'https://authurl';
      const testRequestUrl = `${testAuthUrl}/request/package`;
      const testOptions: InputBoxOptions = {
        ignoreFocusOut: true,
        prompt: AuthPrompt.enterAuthorizationUrl,
        placeHolder: 'Authorization url',
        value: testAuthUrl
      }
      const expected = undefined;

      when(this.mockWindow.showInputBox(deepEqual(testOptions)))
        .thenResolve(<any>testInput);

      // test
      const actual = await this.testInterations.confirmAuthorziationUrl(
        testAuthUrl,
        testRequestUrl
      );

      // verify
      verify(this.mockWindow.showInputBox(deepEqual(testOptions))).once();

      // assert
      assert.equal(actual, expected);
    }
  ],

  "returns undefined when auth input and request domain mismatch":
    async function (this: TestContext) {
      const testAuthUrl = 'https://authurl';
      const testRequestUrl = `${testAuthUrl}/request/package`;
      const testInput = `https://different-domain`;
      const testRetryOptions: MessageOptions = { modal: true, detail: '' };
      const testRetry = false;
      const expected = undefined;

      when(this.mockWindow.showInputBox(anything())).thenResolve(<any>testInput);
      when(
        this.mockWindow.showInformationMessage(
          AuthPrompt.authorizationWrongDomain,
          deepEqual(testRetryOptions),
          'Retry'
        )
      ).thenResolve(<any>testRetry);

      // test
      const actual = await this.testInterations.confirmAuthorziationUrl(
        testAuthUrl,
        testRequestUrl
      );

      // verify
      verify(this.mockWindow.showInputBox(anything())).once();

      verify(
        this.mockWindow.showInformationMessage(
          AuthPrompt.authorizationWrongDomain,
          deepEqual(testRetryOptions),
          'Retry'
        )
      ).once();

      // assert
      assert.equal(actual, expected);
    },

  "returns undefined when auth input and request partially mismatch":
    async function (this: TestContext) {
      const testAuthUrl = 'https://authurl';
      const testRequestUrl = `${testAuthUrl}/request/package`;
      const testInput = `${testAuthUrl}/partial/mismatch`;
      const testRetryOptions: MessageOptions = { modal: true, detail: '' };
      const testRetry = false;
      const expected = undefined;

      when(this.mockWindow.showInputBox(anything())).thenResolve(<any>testInput);
      when(
        this.mockWindow.showInformationMessage(
          AuthPrompt.authorizationUrlPartialMismatch(testRequestUrl),
          deepEqual(testRetryOptions),
          'Retry'
        )
      ).thenResolve(<any>testRetry);

      // test
      const actual = await this.testInterations.confirmAuthorziationUrl(
        testAuthUrl,
        testRequestUrl
      );

      // verify
      verify(this.mockWindow.showInputBox(anything())).once();

      verify(
        this.mockWindow.showInformationMessage(
          AuthPrompt.authorizationUrlPartialMismatch(testRequestUrl),
          deepEqual(testRetryOptions),
          'Retry'
        )
      ).once();

      // assert
      assert.equal(actual, expected);
    },

  "returns valid input urls": async function (this: TestContext) {
    const testAuthUrl = 'https://authurl';
    const testRequestUrl = `${testAuthUrl}/request/package`;
    const testInput = `${testAuthUrl}/request`;

    when(this.mockWindow.showInputBox(anything())).thenResolve(<any>testInput);

    // test
    const actual = await this.testInterations.confirmAuthorziationUrl(
      testAuthUrl,
      testRequestUrl
    );

    // verify
    verify(this.mockWindow.showInputBox(anything())).once();

    // assert
    assert.equal(actual, testInput);
  }
}