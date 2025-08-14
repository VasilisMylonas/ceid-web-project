import { validator } from "../config/validation.js";

export const queryUsersSchema = {
  query: {
    role: validator
      .string()
      .valid("student", "professor", "secretary")
      .optional(),
    offset: validator.number().integer().min(0).optional(),
    limit: validator.number().integer().min(0).optional(),
  },
};

export const getUserSchema = {
  params: {
    id: validator.number().integer().required(),
  },
};

export const patchUserSchema = {
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

export const deleteUserSchema = {
  params: {
    id: validator.number().integer().required(),
  },
};
