import { AuthenticationInteractions, basicAuthPrompt } from '#extension/authorization';
import type { IVsCodeWindow } from '#extension/vscode';
import assert from 'assert';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import type { InputBoxOptions, MessageOptions } from 'vscode';

type TestContext = {
  mockWindow: IVsCodeWindow
  testAuthUrl: string
  testUserNameOptions: InputBoxOptions
  testPasswordOptions: InputBoxOptions
  testInterations: AuthenticationInteractions
}

export const enterBasicAuthDetailsTests = {

  beforeEach: function (this: TestContext) {
    this.mockWindow = mock<IVsCodeWindow>();
    this.testAuthUrl = 'https://authurl';
    this.testUserNameOptions = {
      ignoreFocusOut: true,
      prompt: basicAuthPrompt.enterBasicAuthUsername(this.testAuthUrl),
      placeHolder: 'Basic auth username',
      password: false
    };
    this.testPasswordOptions = {
      ignoreFocusOut: true,
      prompt: basicAuthPrompt.enterBasicAuthPassword(this.testAuthUrl),
      placeHolder: 'Basic auth password',
      password: true
    };

    this.testInterations = new AuthenticationInteractions(instance(this.mockWindow));
  },

  "prompts for username": async function (this: TestContext) {
    const expected = undefined;

    when(this.mockWindow.showInputBox(deepEqual(this.testUserNameOptions)))
      .thenResolve(undefined);

    // test
    const actual = await this.testInterations.enterBasicAuthDetails(this.testAuthUrl);

    // verify
    verify(this.mockWindow.showInputBox(deepEqual(this.testUserNameOptions))).once();

    // assert
    assert.equal(actual, expected);
  },

  "prompts username is invalid": async function (this: TestContext) {
    const testInvalidUsername = 'test:invalid';
    const testRetryMessage = basicAuthPrompt.invalidBasicAuthUsername;
    const testInfoOptions: MessageOptions = { modal: true, detail: '' };
    const expected = undefined;

    when(this.mockWindow.showInputBox(deepEqual(this.testUserNameOptions)))
      .thenResolve(<any>testInvalidUsername);

    when(
      this.mockWindow.showInformationMessage(
        testRetryMessage,
        deepEqual(testInfoOptions),
        'Retry'
      )
    ).thenResolve(undefined);

    // test
    const actual = await this.testInterations.enterBasicAuthDetails(this.testAuthUrl);

    // verify
    verify(this.mockWindow.showInputBox(deepEqual(this.testUserNameOptions))).once();
    verify(
      this.mockWindow.showInformationMessage(
        testRetryMessage,
        deepEqual(testInfoOptions),
        'Retry'
      )
    ).once();

    // assert
    assert.equal(actual, expected);
  },

  "prompts for password": async function (this: TestContext) {
    const testUsername = 'test user name';
    const expected = undefined;

    when(this.mockWindow.showInputBox(deepEqual(this.testUserNameOptions)))
      .thenResolve(<any>testUsername);

    when(this.mockWindow.showInputBox(deepEqual(this.testPasswordOptions)))
      .thenResolve(undefined);

    // test
    const actual = await this.testInterations.enterBasicAuthDetails(this.testAuthUrl);

    // verify
    verify(this.mockWindow.showInputBox(deepEqual(this.testUserNameOptions))).once();
    verify(this.mockWindow.showInputBox(deepEqual(this.testPasswordOptions))).once();

    // assert
    assert.equal(actual, expected);
  },

  "returns encoded username and password": async function (this: TestContext) {
    const testUsername = 'test user name';
    const testPassword = 'test password';
    const expected = btoa(`${testUsername}:${testPassword}`);

    when(this.mockWindow.showInputBox(deepEqual(this.testUserNameOptions)))
      .thenResolve(<any>testUsername);

    when(this.mockWindow.showInputBox(deepEqual(this.testPasswordOptions)))
      .thenResolve(<any>testPassword);

    // test
    const actual = await this.testInterations.enterBasicAuthDetails(this.testAuthUrl);

    // verify
    verify(this.mockWindow.showInputBox(deepEqual(this.testUserNameOptions))).once();
    verify(this.mockWindow.showInputBox(deepEqual(this.testPasswordOptions))).once();

    // assert
    assert.equal(actual, expected);
  }

}