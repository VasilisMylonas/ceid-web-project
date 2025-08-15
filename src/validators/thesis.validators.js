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
  },
};

export const inviteProfessorToThesisValidator = {
  params: {
    id: validator.number().integer().min(1),
  },
  body: {
    professorId: validator.number().integer().min(1),
  },
};

export const deleteThesisValidator = {
  params: {
    id: validator.number().integer().min(1),
  },
};

export const putThesisDocumentValidator = {
  params: {
    id: validator.number().integer().min(1),
  },
};

export const getThesisDocumentValidator = {
  params: {
    id: validator.number().integer().min(1),
  },
};
