import type { ILogger } from '#domain/logging';
import { OnFileLinkClick } from '#extension/events';
import type { IVsCodeEnv } from '#extension/vscode';
import { test } from 'mocha-ui-esm';
import { instance, mock, verify } from 'ts-mockito';

type TestContext = {
  mockVsCodeEnv: IVsCodeEnv
  mockLogger: ILogger
}

export const onFileLinkClickTests = {

  [test.title]: OnFileLinkClick.name,

  beforeEach: function (this: TestContext) {
    this.mockVsCodeEnv = mock<IVsCodeEnv>();
    this.mockLogger = mock<ILogger>();
  },

  "provides file uri to env.openExternal": async function (this: TestContext) {
    const testFilePath = 'some/path/dir';
    const testEvent = new OnFileLinkClick(
      instance(this.mockVsCodeEnv),
      instance(this.mockLogger)
    );

    // test
    await testEvent.execute({
      packageResponse: {
        fetchedPackage: {
          version: testFilePath
        }
      }
    } as any);

    // verify
    verify(this.mockVsCodeEnv.openExternal(<any>`file:///${testFilePath}`)).once();
  },

};