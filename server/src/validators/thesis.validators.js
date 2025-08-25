import { validator } from "../config/validation.js";
import {
  ThesisRole,
  ThesisStatus,
  ResourceKind,
  PresentationKind,
} from "../constants.js";

export default {
  cancel: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
    body: validator.object({
      assemblyYear: validator.number().integer().min(2000).required(),
      assemblyNumber: validator.number().integer().min(1).required(),
    }),
  },
  patchStatus: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
    body: validator.object({
      status: validator
        .string()
        .valid(ThesisStatus.UNDER_EXAMINATION, ThesisStatus.COMPLETED)
        .required(),
    }),
  },
  delete: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  putDraft: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  getDraft: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  post: {
    body: validator
      .object({
        topicId: validator.number().integer().min(1).required(),
        studentId: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  getNotes: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  postNote: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
    body: validator
      .object({
        content: validator.string().min(1).required(),
      })
      .unknown(false),
  },
  getInvitations: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  postInvitation: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
    body: validator
      .object({
        professorId: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },

  // TODO
  get: {
    params: validator
      .object({
        id: validator.number().integer().min(1).required(),
      })
      .unknown(false),
  },
  // TODO
  query: {
    query: validator
      .object({
        limit: validator.number().integer().min(0).optional(),
        offset: validator.number().integer().min(0).optional(),
        role: validator
          .string()
          .valid(ThesisRole.SUPERVISOR, ThesisRole.COMMITTEE_MEMBER)
          .optional(),
        studentId: validator.number().integer().min(1).optional(),
        professorId: validator.number().integer().min(1).optional(),
        topicId: validator.number().integer().min(1).optional(),
        status: validator
          .string()
          .valid(...Object.values(ThesisStatus))
          .optional(),
      })
      .unknown(false)
      .with("role", "professorId"),
  },

  // TODO
  // getPresentations: {
  //   params: validator
  //     .object({
  //       id: validator.number().integer().min(1).required(),
  //     })
  //     .unknown(false),
  // },
  // postPresentation: {
  //   params: validator
  //     .object({
  //       id: validator.number().integer().min(1).required(),
  //     })
  //     .unknown(false),
  //   body: validator
  //     .object({
  //       date: validator.date().min("now").required(),
  //       kind: validator
  //         .string()
  //         .valid(...Object.values(PresentationKind))
  //         .required(),
  //     })
  //     .unknown(false)
  //     .when("kind", {
  //       is: PresentationKind.ONLINE,
  //       then: validator.object({
  //         link: validator.string().uri().required(),
  //       }),
  //       otherwise: validator.object({
  //         hall: validator.string().min(1).required(),
  //       }),
  //     }),
  // },
  // getResources: {
  //   params: validator
  //     .object({
  //       id: validator.number().integer().min(1).required(),
  //     })
  //     .unknown(false),
  // },
  // postResource: {
  //   params: validator
  //     .object({
  //       id: validator.number().integer().min(1).required(),
  //     })
  //     .unknown(false),
  //   body: validator.object({
  //     link: validator.string().uri().required(),
  //     kind: validator
  //       .string()
  //       .valid(...Object.values(ResourceKind))
  //       .required(),
  //   }),
  // },
};
