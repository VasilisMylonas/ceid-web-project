import { validator } from "./config/validation.js";

export const loginBodySchema = {
  username: validator.string().min(1).required(),
  password: validator.string().min(1).required(),
};

export const userQuerySchema = validator.object({
  role: validator
    .string()
    .valid("student", "professor", "secretary")
    .optional(),
  offset: validator.number().integer().min(0).optional(),
  limit: validator.number().integer().min(0).optional(),
});

export const userParamsSchema = validator.object({
  id: validator.number().integer().required(),
});

export const patchUserBodySchema = {
  phone: validator.string().phoneNumber().optional(),
  email: validator.string().email().optional(),
  name: validator.string().min(1).optional(),
  password: validator.string().min(1).optional(),
};
