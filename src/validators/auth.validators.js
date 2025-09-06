import { validator } from "../config/validation.js";

export const loginValidator = {
  body: validator
    .object({
      username: validator.string().min(1).required(),
      password: validator.string().min(1).required(),
    })
    .unknown(false),
};
