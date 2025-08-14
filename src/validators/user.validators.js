import { validator } from "../config/validation.js";

export const queryUsersValidator = {
  query: {
    role: validator
      .string()
      .valid("student", "professor", "secretary")
      .optional(),
    offset: validator.number().integer().min(0).optional(),
    limit: validator.number().integer().min(0).optional(),
  },
};

export const getUserValidator = {
  params: {
    id: validator.number().integer().required(),
  },
};

export const patchUserValidator = {
  params: {
    id: validator.number().integer().required(),
  },
  body: {
    phone: validator.string().phoneNumber().optional(),
    email: validator.string().email().optional(),
    name: validator.string().min(1).optional(),
    password: validator.string().min(1).optional(),
  },
};

export const deleteUserValidator = {
  params: {
    id: validator.number().integer().required(),
  },
};
