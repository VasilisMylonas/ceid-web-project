import Joi from "joi";
import JoiPhoneNumber from "joi-phone-number";
import { validate as joiValidate } from "express-joi-validations";

export const validator = Joi.extend(JoiPhoneNumber);

export function validate(schema) {
  return joiValidate({
    params: schema.params || validator.object({}).unknown(false),
    body: schema.body || validator.object({}).unknown(false),
    query: schema.query || validator.object({}).unknown(false),
    headers: schema.headers || validator.object({}).unknown(true),
  });
}
