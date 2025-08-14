import { validator } from "./config/validation.js";

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

export const loginSchema = {
  body: {
    username: validator.string().min(1).required(),
    password: validator.string().min(1).required(),
  },
};

export const queryTopicsSchema = {
  query: {
    professorId: validator.number().integer().optional(),
    limit: validator.number().integer().min(0).optional(),
    offset: validator.number().integer().min(0).optional(),
    keywords: validator.string().optional(),
  },
};

export const getTopicSchema = {
  params: {
    id: validator.number().integer().required(),
  },
};

export const getTopicDescriptionSchema = {
  params: {
    id: validator.number().integer().required(),
  },
};

export const postTopicSchema = {
  body: {
    title: validator.string().min(1).required(),
    summary: validator.string().min(1).required(),
  },
};

export const patchTopicSchema = {
  params: {
    id: validator.number().integer().required(),
  },
  body: {
    title: validator.string().min(1).optional(),
    summary: validator.string().min(1).optional(),
  },
};

export const uploadTopicDescriptionSchema = {
  params: {
    id: validator.number().integer().required(),
  },
};

export const queryThesesSchema = {
  query: {
    limit: validator.number().integer().min(0).optional(),
    offset: validator.number().integer().min(0).optional(),
    keywords: validator.string().optional(),
  },
};
