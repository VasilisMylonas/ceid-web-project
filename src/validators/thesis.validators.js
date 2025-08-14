import { validator } from "../config/validation.js";

export const queryThesesValidator = {
  query: {
    limit: validator.number().integer().min(0).optional(),
    offset: validator.number().integer().min(0).optional(),
    keywords: validator.string().optional(),
  },
};

export const getThesisValidator = {
  params: {
    id: validator.number().integer().min(1),
  },
};

export const patchThesisValidator = {
  params: {
    id: validator.number().integer().min(1),
  },
  body: {
    nemertesLink: validator.string().optional(),
    protocolNumber: validator.string().optional(),
    startDate: validator.date().optional(),
    endDate: validator.date().optional(),
    statusReason: validator.string().optional(),
    status: validator
      .string()
      .valid("pending", "approved", "rejected", "completed", "cancelled")
      .optional(),
  },
};

export const inviteProfessorToThesisValidator = {
  params: {
    id: validator.number().integer().min(1),
  },
  body: {
    professorId: validator.number().integer().min(1),
    // Add other fields if needed
  },
};

export const deleteThesisValidator = {
  params: {
    id: validator.number().integer().min(1),
  },
};
