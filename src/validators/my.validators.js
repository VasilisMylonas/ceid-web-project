import { ThesisRole, ThesisStatus } from "../constants.js";
import Joi from "joi";
import userValidators from "./user.validators.js";

export default {
  getTopics: {
    query: Joi.object({
      limit: Joi.number().integer().min(0).optional(),
      offset: Joi.number().integer().min(0).optional(),
      status: Joi.string().valid("assigned", "unassigned").optional(),
    }).unknown(false),
  },
  getTheses: {
    query: Joi.object({
      limit: Joi.number().integer().min(0).optional(),
      offset: Joi.number().integer().min(0).optional(),
      status: Joi.string()
        .valid(...Object.keys(ThesisStatus))
        .optional(),
      role: Joi.string()
        .valid(...Object.keys(ThesisRole))
        .optional(),
    }).unknown(false),
  },
  getInvitations: {
    query: Joi.object({
      limit: Joi.number().integer().min(0).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }).unknown(false),
  },
  getProfile: {},
  patchProfile: {
    body: userValidators.patch.body,
  },
  deleteProfile: {},
  getThesis: {},
  getStats: {},
};
