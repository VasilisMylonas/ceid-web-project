import Joi from "joi";

export const loginValidator = {
  body: Joi.object({
    username: Joi.string().min(1).required(),
    password: Joi.string().min(1).required(),
  }).unknown(false),
};
