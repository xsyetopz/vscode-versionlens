import { type AsyncEvent, type IDisposable, AsyncEmitter } from '#domain/utils';
import { test } from 'mocha-ui-esm';
import { instance, mock, verify } from 'ts-mockito';

export const asyncEmitterTests = {

  [test.title]: AsyncEmitter.name,

  fire: {
    "$i: sets this arg and spreads fn args": [
      [[]],
      [[1, 2, 3]],
      async function (testArgs: []) {
        const mockListener = mock<AsyncEvent>();
        const testThisArg = {};
        const emitter = new AsyncEmitter();

        emitter.registerListener(instance(mockListener), testThisArg);

        // test
        await emitter.fire(...testArgs)

        // verify
        verify(mockListener.call(testThisArg, ...testArgs)).once()
      }
    ]
  },
  dispose: {
    "single dispose": async function () {
      const mockDisposable = mock<IDisposable>();
      const emitter = new AsyncEmitter();
      emitter.disposable = instance(mockDisposable);

      // test
      await emitter.dispose();

      // assert
      verify(mockDisposable.dispose()).once()
    },
    "multi dispose": async function () {
      const mockDisposables = [
        mock<IDisposable>(),
        mock<IDisposable>()
      ];
      const emitter = new AsyncEmitter(mockDisposables.map(x => instance(x)));

      // test
      await emitter.dispose();

      // assert
      for (const x of mockDisposables) verify(x.dispose()).once()
    },
  }
}