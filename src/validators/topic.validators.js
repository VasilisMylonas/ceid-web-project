import { validator } from "../config/validation.js";

export const getTopicSchema = {
  params: {
    id: validator.number().integer().required(),
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
