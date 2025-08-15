import { validator } from "../config/validation.js";

export const queryThesesValidator = {
  query: validator
    .object({
      limit: validator.number().integer().min(0).optional(),
      offset: validator.number().integer().min(0).optional(),
      role: validator
        .string()
        .valid("supervisor", "committee_member")
        .optional(),
      studentId: validator.number().integer().min(1).optional(),
      professorId: validator.number().integer().min(1).optional(),
      topicId: validator.number().integer().min(1).optional(),
      status: validator
        .string()
        .valid(
          "under_assignment",
          "pending",
          "approved",
          "rejected",
          "completed",
          "cancelled",
          "under_examination"
        )
        .optional(),
    })
    .unknown(false)
    .with("role", "professorId"), // If role is provided, professorId must also be provided
};

export const getThesisValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};

export const patchThesisValidator = {
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
};

export const deleteThesisValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};

export const putThesisDocumentValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};

export const getThesisDocumentValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};

export const getThesisTimelineValidator = {
  params: validator
    .object({
      id: validator.number().integer().min(1).required(),
    })
    .unknown(false),
};
