import { validator } from "../config/validation.js";

export const queryStudentsValidator = {
  query: {
    am: validator.string().optional(),
    name: validator.string().optional(),
    limit: validator.number().integer().min(1),
    offset: validator.number().integer().min(0),
  },
};
