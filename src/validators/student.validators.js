import Joi from "joi";

export const queryStudentsValidator = {
  query: Joi.object({
    search: Joi.string().min(1).optional(),
    limit: Joi.number().integer().min(1),
    offset: Joi.number().integer().min(0),
  }),
};
