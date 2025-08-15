import { validator } from "../config/validation.js";

export const getTopicValidator = {
  params: {
    id: validator.number().integer().required(),
  },
};
export const queryTopicsValidator = {
  query: {
    professorId: validator.number().integer().optional(),
    limit: validator.number().integer().min(0).optional(),
    offset: validator.number().integer().min(0).optional(),
    keywords: validator.string().optional(),
  },
};
export const getTopicDescriptionValidator = {
  params: {
    id: validator.number().integer().required(),
  },
};
export const postTopicValidator = {
  body: {
    title: validator.string().min(1).required(),
    summary: validator.string().min(1).required(),
  },
};
export const patchTopicValidator = {
  params: {
    id: validator.number().integer().required(),
  },
  body: {
    title: validator.string().min(1).optional(),
    summary: validator.string().min(1).optional(),
  },
};
export const putTopicDescriptionValidator = {
  params: {
    id: validator.number().integer().required(),
  },
};
export const deleteTopicValidator = {
  params: {
    id: validator.number().integer().required(),
  },
};
