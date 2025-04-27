import { ClientResponseSource } from './definitions';

export class ShellClientRequestError extends Error {

  constructor(message: string, cause: Error) {
    super(`${ShellClientRequestError.name}:\n${message}`, { cause });
  }

  get cause(): Error { return <Error>super.cause };
}

export class HttpRequestError {
  constructor(
    readonly source: ClientResponseSource,
    readonly status: number,
    readonly data: string,
    readonly rejected = true
  ) { }
}