import Joi from "joi";
import JoiPhoneNumber from "joi-phone-number";
import { validate as joiValidate } from "express-joi-validations";

export const validator = Joi.extend(JoiPhoneNumber);

export function validate(schema) {
  return joiValidate({
    params: validator.object(schema.params || {}).unknown(false),
    body: validator.object(schema.body || {}).unknown(false),
    query: validator.object(schema.query || {}).unknown(false),
    headers: validator.object(schema.headers || {}).unknown(true),
  });
}
