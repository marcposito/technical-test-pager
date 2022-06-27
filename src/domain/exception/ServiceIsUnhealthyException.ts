import HttpThrowableException from "./HttpThrowableException";

export class ServiceIsUnhealthyException extends HttpThrowableException {
  constructor() {
    super(
      "Cannot flag service as unhealthy if it is already unhealthy",
      "ServiceIsUnhealthyException"
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
