import Joi from "joi";

export default {
  query: {
    query: Joi.object({
      q: Joi.string().min(1).optional(),
      limit: Joi.number().integer().min(0).optional(),
      offset: Joi.number().integer().min(0).optional(),
      assigned: Joi.boolean().optional(),
    }).unknown(false),
  },
};
