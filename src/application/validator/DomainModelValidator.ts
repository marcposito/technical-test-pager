import ValidationError from "./ValidationError";

interface DomainModelValidator<T> {
  validate(model: T): Promise<boolean>;
  getErrors(): Array<ValidationError>;
}

export default DomainModelValidator;
