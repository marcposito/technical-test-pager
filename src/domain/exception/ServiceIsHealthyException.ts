import HttpThrowableException from "./HttpThrowableException";

export class ServiceIsHealthyException extends HttpThrowableException {
  constructor() {
    super(
      "Cannot flag service as healthy if it is already healthy",
      "ServiceIsHealthyException"
    );
  }

  response(): any {
    return {
      message: this.message,
    };
  }

  get httpCode(): number {
    return 400;
  }
}
