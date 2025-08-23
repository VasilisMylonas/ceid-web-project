import { InvitationResponse } from "src/constants.js";
import { validator } from "../config/validation.js";

export default {
  patchResponse: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
    body: validator
      .object({
        response: validator
          .string()
          .valid(InvitationResponse.ACCEPTED, InvitationResponse.DECLINED)
          .required(),
      })
      .unknown(false),
  },
  delete: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
};
