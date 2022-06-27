import DomainException from "./DomainException";

abstract class HttpThrowableException extends DomainException {
  abstract response(): any;
  abstract get httpCode(): number;
}

export default HttpThrowableException;
