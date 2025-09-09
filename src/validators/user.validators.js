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
  post: {
    body: validator
      .object({
        username: validator.string().min(1).required(),
        name: validator.string().min(1).required(),
        email: validator.string().email().required(),
        password: validator.string().min(1).required(),
        role: validator
          .string()
          .valid(...Object.values(UserRole))
          .required(),
        phone: validator.string().phoneNumber().required(),
        am: validator.number().integer().min(1).when("role", {
          is: UserRole.STUDENT,
          then: validator.required(),
          otherwise: validator.forbidden(),
        }),
      })
      .unknown(false),
  },
  putAll: {
    body: validator.array().items(
      validator.object({
        username: validator.string().min(1).required(),
        name: validator.string().min(1).required(),
        email: validator.string().email().required(),
        password: validator.string().min(1).required(),
        role: validator
          .string()
          .valid(...Object.values(UserRole))
          .required(),
        phone: validator.string().phoneNumber().required(),
        am: validator.number().integer().min(1).when("role", {
          is: UserRole.STUDENT,
          then: validator.required(),
          otherwise: validator.forbidden(),
        }),
        division: validator.string().min(1).when("role", {
          is: UserRole.PROFESSOR,
          then: validator.required(),
          otherwise: validator.forbidden(),
        }),
      })
    ),
  },
};
