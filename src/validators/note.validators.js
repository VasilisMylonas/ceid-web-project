import { validator } from "../config/validation.js";

export const getNoteValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};

export const deleteNoteValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};

export const patchNoteValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
  body: validator
    .object({
      content: validator.string().min(1).optional(),
    })
    .unknown(false),
};
