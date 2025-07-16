import Joi from "joi";
import JoiPhoneNumber from "joi-phone-number";

export const validator = Joi.extend(JoiPhoneNumber);
