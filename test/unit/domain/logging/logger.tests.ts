import {
  createLoggerFactory,
  type ILogger,
  type ILoggerSink,
  LogLevel,
  LogLevelName
} from '#domain/logging';
import { test } from '@esm-test/esm-test-node';
import { anything, instance, mock, verify, when } from 'ts-mockito';

type TestContext = {
  mockSink: ILoggerSink
  testLogger: ILogger
}

export const loggerTests = {

  [test.title]: 'Logger',

  beforeEach: function (this: TestContext) {
    this.mockSink = mock<ILoggerSink>();
    var testFactory = createLoggerFactory([instance(this.mockSink)]);
    this.testLogger = testFactory('test-namespace');

    when(this.mockSink.logLevel).thenReturn(LogLevel.trace);
  },

  "parses $1": [
    ["Numbers", "numbers {one} {two}", [1, 2], 'numbers 1 2'],
    ["Strings", "hello {place}", ['world'], 'hello world'],
    ["Arrays", "array {items}", [[1, 2, 3]], 'array [1,2,3]'],
    ["Objects", "object {data}", [{ item: 1 }], 'object {"item":1}'],
    ["URLs", "url {url}", [new URL('https://user:password@1.1.1.1:5454')], 'url https://***:***@1.1.1.1:5454/'],
    function (this: TestContext, testTitle: string, testTemplate: string, testArgs: any[], expectedMsg: string) {
      const testLevels = Object.keys(LogLevel)
        .filter(x => Number.isNaN(Number.parseInt(x)) === false)
        .map(x => Number.parseInt(x));

      testLevels.forEach((testLevel: LogLevel) => {
        const testLevelFn = LogLevel[testLevel] as LogLevelName
        // test
        this.testLogger[testLevelFn](testTemplate, ...testArgs)
        // assert
        verify(this.mockSink.log(testLevel, 'test-namespace', expectedMsg)).once();
      });
    }
  ],

  "ignores sinks with lower log levels": function (this: TestContext) {
    when(this.mockSink.logLevel).thenReturn(LogLevel.error);

    // test
    this.testLogger.info("should ignore");

    // verify
    verify(this.mockSink.log(anything(), anything(), anything())).never();
  }

}