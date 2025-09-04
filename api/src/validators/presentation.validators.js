import { validator } from "../config/validation.js";
import { PresentationKind } from "../constants.js";

export default {
  get: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
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
  put: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
    body: validator
      .object({
        date: validator.date().min("now").required(),
        kind: validator
          .string()
          .valid(...Object.values(PresentationKind))
          .required(),
        hall: validator.string().min(1).optional(),
        link: validator.string().uri().optional(),
      })
      .unknown(false)
      .xor("hall", "link"),
  },
};
