import { validator } from "./config/validation.js";

export const loginBodySchema = validator.object({
  username: validator.string().min(1).required(),
  password: validator.string().min(1).required(),
});

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

export const patchUserBodySchema = validator.object({
  phone: validator.string().phoneNumber().optional(),
  email: validator.string().email().optional(),
  name: validator.string().min(1).optional(),
  password: validator.string().min(1).optional(),
});

export const topicQuerySchema = validator.object({
  professorId: validator.number().integer().optional(),
  limit: validator.number().integer().min(0).optional(),
  offset: validator.number().integer().min(0).optional(),
});

export const topicBodySchema = validator.object({
  title: validator.string().min(1).required(),
  summary: validator.string().min(1).required(),
});

export const topicParamsSchema = validator.object({
  id: validator.number().integer().required(),
});

export const patchTopicBodySchema = validator.object({
  title: validator.string().min(1).optional(),
  summary: validator.string().min(1).optional(),
});
