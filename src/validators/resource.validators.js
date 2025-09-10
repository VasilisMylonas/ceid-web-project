import { ResourceKind } from "../constants.js";
import Joi from "joi";

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
      link: Joi.string().uri().required(),
      kind: Joi.string()
        .valid(...Object.values(ResourceKind))
        .required(),
    }).unknown(false),
  },
};
