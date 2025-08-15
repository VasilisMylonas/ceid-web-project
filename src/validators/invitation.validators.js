// invitation.validators.js
import Joi from "joi";

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
    status: Joi.string().valid("pending", "accepted", "declined").optional(),
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
