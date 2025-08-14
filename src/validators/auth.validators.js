import { validator } from "../config/validation.js";

export const loginSchema = {
  body: {
    username: validator.string().min(1).required(),
    password: validator.string().min(1).required(),
  },
};
