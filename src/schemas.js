import { validator } from "./config/validation.js";

export const queryThesesSchema = {
  query: {
    limit: validator.number().integer().min(0).optional(),
    offset: validator.number().integer().min(0).optional(),
    keywords: validator.string().optional(),
  },
};
