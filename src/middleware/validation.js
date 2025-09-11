import Joi from "joi";
import { validate as joiValidate } from "express-joi-validations";

export function validate(schema) {
  return joiValidate({
    params: schema.params || Joi.object({}).unknown(false),
    body: schema.body || Joi.object({}).unknown(false),
    query: schema.query || Joi.object({}).unknown(false),
    headers: schema.headers || Joi.object({}).unknown(true),
  });
}
