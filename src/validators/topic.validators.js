import { validator } from "../config/validation.js";

export default class TopicValidators {
  static get = {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  };

  static put = {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
    body: validator
      .object({
        title: validator.string().min(1).optional(),
        summary: validator.string().min(1).optional(),
      })
      .unknown(false),
  };

  static delete = {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  };

  static getDescription = {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  };

  static putDescription = {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  };
}

// TODO
// export const queryTopicsValidator = {
//   query: validator
//     .object({
//       professorId: validator.number().integer().min(1).optional(),
//       limit: validator.number().integer().min(0).optional(),
//       offset: validator.number().integer().min(0).optional(),
//       keywords: validator.string().optional(),
//       status: validator.string().valid("assigned", "unassigned").optional(),
//     })
//     .unknown(false),
// };
// export const postTopicValidator = {
//   body: validator
//     .object({
//       title: validator.string().min(1).required(),
//       summary: validator.string().min(1).required(),
//     })
//     .unknown(false),
// };
