import * as Joi from "@hapi/joi";
import { ObjectSchema } from "@hapi/joi";
import Validator from "./Validator";

class AcknowledgeTimeoutValidator extends Validator {
  getRules(): ObjectSchema {
    return Joi.object().keys({
      serviceId: Joi.string().required(),
    });
  }
}

export default AcknowledgeTimeoutValidator;
