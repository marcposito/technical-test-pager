import ValidationError from "../../application/validator/ValidationError";
import HttpThrowableException from "./HttpThrowableException";

export class ValidationException extends HttpThrowableException {
  public errors: Array<ValidationError>;

  constructor(errors: Array<ValidationError>) {
    super("Some validation errors occurred", "ValidationException");

    this.errors = errors;
  }

  response(): any {
    return {
      message: this.message,
      errors: this.errors,
    };
  }

  get httpCode(): number {
    return 400;
  }
}
