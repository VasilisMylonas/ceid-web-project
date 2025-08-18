import Joi from "joi";
import { InvitationStatus } from "../constants";

export const getInvitationValidator = {
  params: Joi.object({
    id: Joi.number().integer().min(1).required(),
  }).unknown(false),
};

export const patchInvitationValidator = {
  params: Joi.object({
    id: Joi.number().integer().min(1).required(),
  }).unknown(false),
  body: Joi.object({
    status: Joi.string()
      .valid(...Object.values(InvitationStatus))
      .optional(),
  }).unknown(false),
};

export const acceptInvitationValidator = {
  params: Joi.object({
    id: Joi.number().integer().min(1).required(),
  }).unknown(false),
};

export const declineInvitationValidator = {
  params: Joi.object({
    id: Joi.number().integer().min(1).required(),
  }).unknown(false),
};
