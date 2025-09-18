import Joi from "joi";
import { ThesisGradingStatus, ThesisRole, ThesisStatus } from "../constants.js";
import presentationValidators from "./presentation.validators.js";
import resourceValidators from "./resource.validators.js";

export default {
  cancel: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      assemblyNumber: Joi.string().min(1).required(),
      cancellationReason: Joi.string().min(1).max(200).required(),
    }),
  },
  examine: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  approve: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      assemblyNumber: Joi.string().min(1).required(),
      protocolNumber: Joi.string().min(1).max(50).required(),
    }),
  },
  complete: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  delete: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  putDraft: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  getDraft: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  post: {
    body: Joi.object({
      topicId: Joi.number().integer().min(1).required(),
      studentId: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  getNotes: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  postNote: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      content: Joi.string().min(1).max(300).required(),
    }).unknown(false),
  },
  getInvitations: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  postInvitation: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      professorId: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  putNemertesLink: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      nemertesLink: Joi.string().uri().required(),
    }).unknown(false),
  },
  putGrading: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      grading: Joi.string()
        .valid(...Object.values(ThesisGradingStatus))
        .required(),
    }).unknown(false),
  },
  get: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  query: {
    query: Joi.object({
      limit: Joi.number().integer().min(0).optional(),
      offset: Joi.number().integer().min(0).optional(),
      role: Joi.string()
        .valid(ThesisRole.SUPERVISOR, ThesisRole.COMMITTEE_MEMBER)
        .optional(),
      studentId: Joi.number().integer().min(1).optional(),
      professorId: Joi.number().integer().min(1).optional(),
      topicId: Joi.number().integer().min(1).optional(),
      q: Joi.string().min(1).optional(),
      status: Joi.alternatives()
        .try(
          Joi.string()
            .valid(...Object.values(ThesisStatus))
            .optional(),
          Joi.array().items(
            Joi.string()
              .valid(...Object.values(ThesisStatus))
              .required()
          )
        )
        .optional(),
    })
      .unknown(false)
      .with("role", "professorId"),
  },
  getResources: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  getPresentations: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  postPresentation: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: presentationValidators.put.body,
  },
  postResource: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: resourceValidators.put.body,
  },
  getTimeline: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  getGrades: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  putGrade: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      objectives: Joi.number().min(0).max(10).required(),
      duration: Joi.number().min(0).max(10).required(),
      deliverableQuality: Joi.number().min(0).max(10).required(),
      presentationQuality: Joi.number().min(0).max(10).required(),
    }).unknown(false),
  },
};
