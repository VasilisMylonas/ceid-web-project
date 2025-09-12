import Joi from "joi";

export default {
  get: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },

  post: {
    body: Joi.object({
      title: Joi.string().min(1).required(),
      summary: Joi.string().min(1).required(),
    }).unknown(false),
  },

  put: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      title: Joi.string().min(1).required(),
      summary: Joi.string().min(1).required(),
    }).unknown(false),
  },

  delete: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },

  getDescription: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },

  putDescription: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },

  deleteDescription: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },

  query: {
    query: Joi.object({
      professorId: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(0).optional(),
      offset: Joi.number().integer().min(0).optional(),
      status: Joi.string().valid("assigned", "unassigned").optional(),
    }).unknown(false),
  },
};
