import Joi from "joi";

export default {
  query: Joi.object({
    q: Joi.string().min(1).optional(),
    limit: Joi.number().integer().min(0),
    offset: Joi.number().integer().min(0),
  }).unknown(false),
};
