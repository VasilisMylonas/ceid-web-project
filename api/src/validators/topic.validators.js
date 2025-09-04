import { validator } from "../config/validation.js";

export default {
  get: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },

  post: {
    body: validator
      .object({
        title: validator.string().min(1).required(),
        summary: validator.string().min(1).required(),
      })
      .unknown(false),
  },

  put: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
    body: validator
      .object({
        title: validator.string().min(1).required(),
        summary: validator.string().min(1).required(),
      })
      .unknown(false),
  },

  delete: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },

  getDescription: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },

  putDescription: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },

  query: {
    query: validator
      .object({
        professorId: validator.number().integer().min(1).optional(),
        limit: validator.number().integer().min(0).optional(),
        offset: validator.number().integer().min(0).optional(),
        status: validator.string().valid("assigned", "unassigned").optional(),
      })
      .unknown(false),
  },
};
