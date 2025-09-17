import { UserRole } from "../constants.js";
import Joi from "joi";

export default {
  query: {
    query: Joi.object({
      role: Joi.string()
        .trim()
        .valid(...Object.values(UserRole))
        .optional(),
      offset: Joi.number().integer().min(0).optional(),
      limit: Joi.number().integer().min(0).optional(),
    }).unknown(false),
  },
  get: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  patch: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      phone: Joi.string()
        .trim()
        .regex(/^[0-9]{10}$/)
        .optional(),
      email: Joi.string().trim().email().optional(),
      name: Joi.string().trim().min(1).optional(),
      password: Joi.string().min(1).optional(),
      address: Joi.string().trim().min(1).optional(),
    }).unknown(false),
  },
  delete: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  post: {
    body: Joi.object({
      username: Joi.string().trim().min(1).required(),
      name: Joi.string().trim().min(1).required(),
      email: Joi.string().trim().email().required(),
      password: Joi.string().min(1).required(),
      address: Joi.string().trim().min(1).required(),
      role: Joi.string()
        .trim()
        .valid(...Object.values(UserRole))
        .required(),
      phone: Joi.string()
        .trim()
        .regex(/^[0-9]{10}$/)
        .required(),
      am: Joi.number().integer().min(1).when("role", {
        is: UserRole.STUDENT,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
      division: Joi.string().trim().min(1).when("role", {
        is: UserRole.PROFESSOR,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    }).unknown(false),
  },
  postBatch: {
    body: Joi.array().items(
      Joi.object({
        username: Joi.string().trim().min(1).required(),
        name: Joi.string().trim().min(1).required(),
        email: Joi.string().trim().email().required(),
        password: Joi.string().min(1).required(),
        address: Joi.string().trim().min(1).required(),
        role: Joi.string()
          .trim()
          .valid(...Object.values(UserRole))
          .required(),
        phone: Joi.string()
          .trim()
          .regex(/^[0-9]{10}$/)
          .required(),
        am: Joi.number().integer().min(1).when("role", {
          is: UserRole.STUDENT,
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        }),
        division: Joi.string().trim().min(1).when("role", {
          is: UserRole.PROFESSOR,
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        }),
      })
    ),
  },

  getProfessors: {},

  get: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
};
