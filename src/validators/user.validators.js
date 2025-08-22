import { UserRole } from "../constants.js";
import { validator } from "../config/validation.js";

export default {
  query: {
    query: validator
      .object({
        role: validator
          .string()
          .valid(...Object.values(UserRole))
          .optional(),
        offset: validator.number().integer().min(0).optional(),
        limit: validator.number().integer().min(0).optional(),
      })
      .unknown(false),
  },
  get: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  patch: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
    body: validator
      .object({
        phone: validator.string().phoneNumber().optional(),
        email: validator.string().email().optional(),
        name: validator.string().min(1).optional(),
        password: validator.string().min(1).optional(),
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
};
