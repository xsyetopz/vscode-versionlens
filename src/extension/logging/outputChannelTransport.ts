import type { ILoggerChannel, LoggingOptions } from '#domain/logging';
import { nameOf } from '#domain/utils';
import { throwUndefinedOrNull } from '@esm-test/guards';
import { setImmediate } from 'node:timers';
import type { OutputChannel } from 'vscode';
import * as Winston from 'winston';

// workaround for the invalid index.ds.t export from winston
const WinstonTransport = (<any>Winston).Transport;
const MessageSymbol = Symbol.for('message');
const def = nameOf<OutputChannelTransport>();

export class OutputChannelTransport extends WinstonTransport implements ILoggerChannel {

  constructor(readonly outputChannel: OutputChannel, readonly logging: LoggingOptions) {
    super({ level: logging.level });
    throwUndefinedOrNull(def.outputChannel, outputChannel);
    throwUndefinedOrNull(def.logging, logging);
  }

  get name() {
    return this.outputChannel.name;
  }

  log(entry: any, callback: () => void) {

    setImmediate(() => {
      this.emit('logged', entry)
      this.outputChannel.appendLine(entry[MessageSymbol]);
    });

    callback();
  }

  refreshLoggingLevel() {
    this.logging.defrost();
    super.level = this.logging.level;
  }

}