import { validator } from "../config/validation.js";

export const getPresentationValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};

export const deletePresentationValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};

export const patchPresentationValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
  body: validator
    .object({
      date: validator.date().min("now").optional(),
      hall: validator.string().min(1).optional(),
      kind: validator.string().valid("online", "in-person").optional(),
      link: validator.string().uri().optional(),
    })
    .unknown(false),
};
