import { ValidationErrorItem } from "@hapi/joi";
import IDomainModelValidator from "./DomainModelValidator";
import { ObjectSchema } from "@hapi/joi";
import IValidationError from "./ValidationError";
import DTO from "../../domain/model/DTO";

abstract class Validator implements IDomainModelValidator<DTO> {
  private errors: Array<ValidationErrorItem>;

  abstract getRules(): ObjectSchema;

  async validate(data: DTO): Promise<boolean> {
    this.errors = [];

    try {
      const validated = await this.getRules().validateAsync(data);

      Object.assign(data, validated);
    } catch (err) {
      this.errors = err.details;
    }

    return this.errors.length === 0;
  }

  getErrors(): Array<IValidationError> {
    return this.errors.reduce(
      (
        messages: Array<IValidationError>,
        error: ValidationErrorItem
      ): Array<IValidationError> => {
        messages.push(<IValidationError>{
          field: error.context?.label,
          message: error.message.toLowerCase(),
        });

        return messages;
      },
      []
    );
  }
}

export default Validator;
