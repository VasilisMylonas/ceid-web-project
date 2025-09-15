import { ThesisRole, ThesisStatus } from "../constants.js";
import Joi from "joi";

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
    body: Joi.object({
      phone: Joi.string()
        .regex(/^[0-9]{10}$/)
        .optional(),
      email: Joi.string().email().optional(),
      name: Joi.string().min(1).optional(),
      password: Joi.string().min(1).optional(),
      address: Joi.string().min(1).optional(),
    }).unknown(false),
  },
  deleteProfile: {},
  getThesis: {},
  getStats: {},
};
