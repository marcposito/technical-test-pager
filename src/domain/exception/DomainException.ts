export default class DomainException implements Error {
  protected _message: string;
  protected _name: string;
  protected _previous: Error | null;

  protected constructor(
    message: string,
    name: string = "DomainException",
    previous: Error | null = null
  ) {
    this._message = message;
    this._name = name;
    this._previous = previous;

    Error.captureStackTrace(this);
  }

  get message(): string {
    return this._message;
  }

  get name(): string {
    return this._name;
  }

  get previous(): Error | null {
    return this._previous;
  }
}
