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
      role: Joi.string()
        .valid(ThesisRole.SUPERVISOR, ThesisRole.COMMITTEE_MEMBER)
        .optional(),
      studentId: Joi.number().integer().min(1).optional(),
      topicId: Joi.number().integer().min(1).optional(),
      q: Joi.string().min(1).optional(),
      status: Joi.alternatives().try(
        Joi.string().valid(...Object.values(ThesisStatus)),
        Joi.array()
          .items(
            Joi.string()
              .valid(...Object.values(ThesisStatus))
              .required()
          )
          .optional()
      ),
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
