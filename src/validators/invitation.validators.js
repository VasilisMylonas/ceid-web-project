import { InvitationResponse } from "../constants.js";
import Joi from "joi";

export default {
  putResponse: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      response: Joi.string()
        .valid(InvitationResponse.ACCEPTED, InvitationResponse.DECLINED)
        .required(),
    }).unknown(false),
  },
  delete: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
};
