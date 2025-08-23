import { patchQuery } from "../util.js";
import TopicController from "./topic.controller.js";
import ThesisController from "./thesis.controller.js";
import InvitationController from "./invitation.controller.js";
import { InvitationResponse } from "../constants.js";

export default class MyController {
  // Theses mainly forward to appropriate controllers with patched queries

  static async getTopics(req, res) {
    req = patchQuery(req, { professorId: req.user.id });
    await TopicController.query(req, res);
  }

  static async getTheses(req, res) {
    req = patchQuery(req, { professorId: req.user.id });
    await ThesisController.query(req, res);
  }

  static async getInvitations(req, res) {
    req = patchQuery(req, {
      professorId: req.user.id,
      response: InvitationResponse.PENDING,
    });
    await InvitationController.query(req, res);
  }
}
