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
      content: Joi.string().min(1).max(300).required(),
    }).unknown(false),
  },
};
