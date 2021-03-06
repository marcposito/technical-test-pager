import HttpThrowableException from "./HttpThrowableException";

export class ServiceIsAlreadyAcknowledgedException extends HttpThrowableException {
  constructor() {
    super(
      "Cannot acknowledge a service if is already acknowledged",
      "ServiceIsAlreadyAcknowledgedException"
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
