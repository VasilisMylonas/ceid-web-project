import { validator } from "../config/validation.js";
import { ThesisRole, ThesisStatus } from "../constants.js";

export default {
  query: {
    query: validator
      .object({
        limit: validator.number().integer().min(0).optional(),
        offset: validator.number().integer().min(0).optional(),
        role: validator
          .string()
          .valid(ThesisRole.SUPERVISOR, ThesisRole.COMMITTEE_MEMBER)
          .optional(),
        studentId: validator.number().integer().min(1).optional(),
        professorId: validator.number().integer().min(1).optional(),
        topicId: validator.number().integer().min(1).optional(),
        status: validator
          .string()
          .valid(...Object.values(ThesisStatus))
          .optional(),
      })
      .unknown(false)
      .with("role", "professorId"),
  },
  get: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  post: {
    body: validator
      .object({
        topicId: validator.number().integer().min(1).required(),
        studentId: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  patch: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
    body: validator
      .object({
        nemertesLink: validator.string().optional(),
      })
      .unknown(false),
  },
  delete: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  putDocument: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  getDocument: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  getTimeline: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
};
