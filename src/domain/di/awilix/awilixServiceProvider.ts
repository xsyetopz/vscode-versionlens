import { IServiceProvider } from '#domain/di';
import { throwNotStringOrEmpty, throwUndefinedOrNull } from '@esm-test/guards';
import { asValue, AwilixContainer } from 'awilix';

export class AwilixServiceProvider implements IServiceProvider {

  constructor(
    readonly name: string,
    readonly container: AwilixContainer
  ) {
    throwNotStringOrEmpty("name", name);
    throwUndefinedOrNull("container", container);
  }

  registerService<T>(name: string, resolver: T) {
    this.container.register(name, asValue(resolver));
  }

  getService<T>(name: string): T {
    return this.container.resolve<T>(name);
  }

  dispose() {
    return this.container.dispose();
  }

}