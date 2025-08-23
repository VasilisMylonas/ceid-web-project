import { ThesisRole, ThesisStatus } from "../constants.js";
import { validator } from "../config/validation.js";

export default {
  getTopics: {
    query: validator
      .object({
        limit: validator.number().integer().min(0).optional(),
        offset: validator.number().integer().min(0).optional(),
        status: validator.string().valid("assigned", "unassigned").optional(),
      })
      .unknown(false),
  },
  getTheses: {
    query: validator
      .object({
        limit: validator.number().integer().min(0).optional(),
        offset: validator.number().integer().min(0).optional(),
        status: validator
          .string()
          .valid(...Object.keys(ThesisStatus))
          .optional(),
        role: validator
          .string()
          .valid(...Object.keys(ThesisRole))
          .optional(),
      })
      .unknown(false),
  },
  getInvitations: {
    query: validator
      .object({
        limit: validator.number().integer().min(0).optional(),
        offset: validator.number().integer().min(0).optional(),
      })
      .unknown(false),
  },
};
