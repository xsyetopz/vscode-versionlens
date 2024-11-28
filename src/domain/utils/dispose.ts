export interface IDisposable {
  dispose: () => Promise<void>;
}

export class Disposable implements IDisposable {

  constructor();
  constructor(disposables: IDisposable[]);
  constructor(readonly disposables: IDisposable[] = []) { }

  get disposable(): IDisposable {
    return this.disposables[0];
  }

  set disposable(value: IDisposable) {
    this.disposables[0] = value;
  }

  async dispose() {
    if (this.disposables.length > 0)
      for (const x of this.disposables) await x.dispose();
    else
      throw new ReferenceError(`'${this.constructor.name}' has no disposable(s) to dispose`)
  }

}

export class DisposableArray extends Array implements IDisposable {

  constructor(disposables: Array<IDisposable>) {
    super();
    if (disposables instanceof Array) this.push(...disposables)
  }

  async dispose() {
    for (const item of this) await item.dispose();
  }

}