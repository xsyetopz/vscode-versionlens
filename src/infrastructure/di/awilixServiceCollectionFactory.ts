import { IServiceCollection, IServiceCollectionFactory } from '#domain/di';
import { AwilixServiceCollection } from "#infrastructure/di";

export class AwilixServiceCollectionFactory implements IServiceCollectionFactory {

  createServiceCollection(): IServiceCollection {
    return new AwilixServiceCollection();
  }

}