import { validator } from "../config/validation.js";

export default {
  get: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
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
  put: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
    body: validator
      .object({
        content: validator.string().min(1).required(),
      })
      .unknown(false),
  },
};
