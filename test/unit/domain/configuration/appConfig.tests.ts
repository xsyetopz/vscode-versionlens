import { type IConfig, Config } from '#domain/configuration';
import { test } from 'mocha-ui-esm';
import assert from 'node:assert';
import { instance, mock, verify, when } from 'ts-mockito';

interface IVsCodeWorkspaceStub {
  getConfiguration(section: string): IConfig
}

type TestContext = {
  mockResolver: IVsCodeWorkspaceStub
}

export const AppConfigTests = {

  [test.title]: Config.name,

  beforeEach: function (this: TestContext) {
    this.mockResolver = mock<IVsCodeWorkspaceStub>()
  },

  "returns default values": function (this: TestContext) {
    const testSection = 'test_section'
    const testKey = 'test_property';
    const cut = new Config(instance(this.mockResolver).getConfiguration, testSection);

    when(this.mockResolver.getConfiguration(testSection))
      .thenReturn({
        get: (key: string, defaultValue?: string) => defaultValue
      })

    // test
    const actual = cut.get(testKey, 'test default value');

    // assert
    verify(this.mockResolver.getConfiguration(testSection)).once();
    assert.equal(actual, 'test default value');
  },

  "accesses frozen repo after first call": function (this: TestContext) {
    const testSection = 'testsection'
    const testKey = 'some_property';
    const expectedFrozenValue = 'test value';

    when(this.mockResolver.getConfiguration(testSection))
      .thenReturn({
        get: section => expectedFrozenValue
      })

    // get original value
    const cut = new Config(instance(this.mockResolver).getConfiguration, testSection);
    const first = cut.get(testKey);
    verify(this.mockResolver.getConfiguration(testSection)).once();
    assert.equal(first, expectedFrozenValue)

    // change value without defrosting
    when(this.mockResolver.getConfiguration(testSection))
      .thenReturn({
        get: key => 'hot value'
      })

    // should still return original value
    const actualFrozen = cut.get(testKey);
    verify(this.mockResolver.getConfiguration(testSection)).atMost(1);
    assert.equal(actualFrozen, expectedFrozenValue)
  },

  "returns hot value after defrost is called": function (this: TestContext) {
    const testSection = 'testsection'
    const testKey = 'some_property';
    let initialValue = 'test value';

    when(this.mockResolver.getConfiguration(testSection))
      .thenReturn({
        get: key => initialValue
      })

    // get original value
    const cut = new Config(instance(this.mockResolver).getConfiguration, testSection);
    const first = cut.get(testKey);
    verify(this.mockResolver.getConfiguration(testSection)).once();
    assert.equal(first, initialValue)

    // change the value
    const expectedHotValue = 'hot value';
    when(this.mockResolver.getConfiguration(testSection))
      .thenReturn({
        get: key => expectedHotValue
      })

    // should return the new value after defrost is called
    cut.defrost();
    const actualFrozen = cut.get(testKey);
    verify(this.mockResolver.getConfiguration(testSection)).twice();
    assert.equal(actualFrozen, expectedHotValue)
  }

}