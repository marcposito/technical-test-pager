import HttpThrowableException from "./HttpThrowableException";

export class ServiceDoesNotHaveMoreLevelsException extends HttpThrowableException {
  constructor() {
    super(
      "Cannot alert more targets if we reached max level",
      "ServiceDoesNotHaveMoreLevelsException"
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
