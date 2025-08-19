import { validator } from "../config/validation.js";

export const queryStudentsValidator = {
  query: validator.object({
    search: validator.string().optional(),
    limit: validator.number().integer().min(1),
    offset: validator.number().integer().min(0),
  }),
};
