import { validator } from "../config/validation.js";

export const getResourceValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};

export const deleteResourceValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};

export const patchResourceValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
  body: validator
    .object({
      link: validator.string().uri().optional(),
      kind: validator
        .string()
        .valid("pdf", "video", "audio", "image", "other")
        .optional(),
    })
    .unknown(false),
};
