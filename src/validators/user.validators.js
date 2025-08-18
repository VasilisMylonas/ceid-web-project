import { UserRole } from "../constants.js";
import { validator } from "../config/validation.js";

export const queryUsersValidator = {
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
};

export const getUserValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};

export const patchUserValidator = {
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
};

export const deleteUserValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};
