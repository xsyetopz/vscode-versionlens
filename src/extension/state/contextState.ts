import { throwNotStringOrEmpty } from '@esm-test/guards';
import { commands } from 'vscode';
import { IContextState } from '../definitions';

export class ContextState<T> implements IContextState<T> {

  constructor(private readonly key: string) {
    throwNotStringOrEmpty("key", key);
  }

  private _value!: T;

  get value(): T {
    return this._value;
  }

  async change(newValue: T): Promise<T> {
    this._value = newValue;
    return await commands.executeCommand(
      'setContext',
      this.key,
      newValue
    );
  }

}