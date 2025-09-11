import Joi from "joi";
import { ThesisRole, ThesisStatus } from "../constants.js";

export default {
  cancel: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      assemblyYear: Joi.number().integer().min(2000).required(),
      assemblyNumber: Joi.number().integer().min(1).required(),
    }),
  },
  patchStatus: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      status: Joi.string()
        .valid(
          ThesisStatus.ACTIVE,
          ThesisStatus.REJECTED,
          ThesisStatus.UNDER_EXAMINATION,
          ThesisStatus.COMPLETED
        )
        .required(),
    }),
  },
  delete: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  putDraft: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  getDraft: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  post: {
    body: Joi.object({
      topicId: Joi.number().integer().min(1).required(),
      studentId: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  getNotes: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  postNote: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      content: Joi.string().min(1).required(),
    }).unknown(false),
  },
  getInvitations: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  postInvitation: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      professorId: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  patchGrading: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
    body: Joi.object({
      grading: Joi.string().valid("enabled", "disabled").required(),
    }).unknown(false),
  },
  get: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).unknown(false),
  },
  query: {
    query: Joi.object({
      limit: Joi.number().integer().min(0).optional(),
      offset: Joi.number().integer().min(0).optional(),
      role: Joi.string()
        .valid(ThesisRole.SUPERVISOR, ThesisRole.COMMITTEE_MEMBER)
        .optional(),
      studentId: Joi.number().integer().min(1).optional(),
      professorId: Joi.number().integer().min(1).optional(),
      topicId: Joi.number().integer().min(1).optional(),
      q: Joi.string().min(1).optional(),
      status: Joi.alternatives().try(
        Joi.string()
          .valid(...Object.values(ThesisStatus))
          .optional(),
        Joi.array()
          .items(
            Joi.string()
              .valid(...Object.values(ThesisStatus))
              .required()
          )
          .optional()
      ),
    })
      .unknown(false)
      .with("role", "professorId"),
  },

  // TODO
  // getPresentations: {
  //   params: Joi
  //     .object({
  //       id: Joi.number().integer().min(1).required(),
  //     })
  //     .unknown(false),
  // },
  // postPresentation: {
  //   params: Joi
  //     .object({
  //       id: Joi.number().integer().min(1).required(),
  //     })
  //     .unknown(false),
  //   body: Joi
  //     .object({
  //       date: Joi.date().min("now").required(),
  //       kind: Joi
  //         .string()
  //         .valid(...Object.values(PresentationKind))
  //         .required(),
  //     })
  //     .unknown(false)
  //     .when("kind", {
  //       is: PresentationKind.ONLINE,
  //       then: Joi.object({
  //         link: Joi.string().uri().required(),
  //       }),
  //       otherwise: Joi.object({
  //         hall: Joi.string().min(1).required(),
  //       }),
  //     }),
  // },
  // getResources: {
  //   params: Joi
  //     .object({
  //       id: Joi.number().integer().min(1).required(),
  //     })
  //     .unknown(false),
  // },
  // postResource: {
  //   params: Joi
  //     .object({
  //       id: Joi.number().integer().min(1).required(),
  //     })
  //     .unknown(false),
  //   body: Joi.object({
  //     link: Joi.string().uri().required(),
  //     kind: Joi
  //       .string()
  //       .valid(...Object.values(ResourceKind))
  //       .required(),
  //   }),
  // },
};
