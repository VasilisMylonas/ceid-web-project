import { validator } from "../config/validation.js";

export const getTopicValidator = {
  params: validator
    .object({
      id: validator.number().integer().required(),
    })
    .unknown(false),
};
export const queryTopicsValidator = {
  query: validator
    .object({
      professorId: validator.number().integer().optional(),
      limit: validator.number().integer().min(0).optional(),
      offset: validator.number().integer().min(0).optional(),
      keywords: validator.string().optional(),
    })
    .unknown(false),
};
export const getTopicDescriptionValidator = {
  params: validator
    .object({
      id: validator.number().integer().required(),
    })
    .unknown(false),
};
export const postTopicValidator = {
  body: validator
    .object({
      title: validator.string().min(1).required(),
      summary: validator.string().min(1).required(),
    })
    .unknown(false),
};
export const patchTopicValidator = {
  params: validator
    .object({
      id: validator.number().integer().required(),
    })
    .unknown(false),
  body: validator
    .object({
      title: validator.string().min(1).optional(),
      summary: validator.string().min(1).optional(),
    })
    .unknown(false),
};
export const putTopicDescriptionValidator = {
  params: validator
    .object({
      id: validator.number().integer().required(),
    })
    .unknown(false),
};
export const deleteTopicValidator = {
  params: validator
    .object({
      id: validator.number().integer().required(),
    })
    .unknown(false),
};
