import { type IDisposable, Disposable } from '#domain/utils';

type EmitterMap<T> = Map<T, AsyncEventData>;

type AsyncEventData = {
  thisArg: any
}

export type AsyncEvent = (...args: any[]) => Promise<void>;

export class AsyncEmitter<T extends AsyncEvent> extends Disposable {

  constructor();
  constructor(disposables: IDisposable[]);
  constructor(disposables: IDisposable[] = []) {
    super(disposables)
  }

  private listeners: EmitterMap<T> = new Map();

  registerListener(listener: T, thisArg: any) {
    // check if the listener exists
    if (this.listeners.has(listener)) {
      throw new Error(`'${listener.name}' listener already registered`)
    }

    // add the new listener
    this.listeners.set(listener, { thisArg });
  }

  async fire(...args: Parameters<T>): Promise<void> {
    for (const [listener, data] of this.listeners) {
      await listener.call(data.thisArg, ...args);
    }
  }

}