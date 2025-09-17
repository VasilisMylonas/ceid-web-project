import Joi from "joi";
import { PresentationKind } from "../constants.js";

export default {
  get: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  delete: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  put: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      date: Joi.date().min("now").required(),
      kind: Joi.string()
        .valid(...Object.values(PresentationKind))
        .required(),
      link: Joi.string().uri().when("kind", {
        is: PresentationKind.ONLINE,
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
      hall: Joi.string().min(1).when("kind", {
        is: PresentationKind.IN_PERSON,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    }).unknown(false),
  },
};
