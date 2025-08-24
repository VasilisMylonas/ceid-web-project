import { patchQuery } from "../util.js";
import TopicController from "./topic.controller.js";
import ThesisController from "./thesis.controller.js";
import InvitationController from "./invitation.controller.js";
import { InvitationResponse } from "../constants.js";

export default class MyController {
  // Theses mainly forward to appropriate controllers with patched queries

  static async getTopics(req, res) {
    const professor = await req.user.getProfessor();
    req = patchQuery(req, { professorId: professor.id });
    await TopicController.query(req, res);
  }

  static async getTheses(req, res) {
    const professor = await req.user.getProfessor();
    req = patchQuery(req, { professorId: professor.id });
    await ThesisController.query(req, res);
  }

  static async getInvitations(req, res) {
    const professor = await req.user.getProfessor();
    req = patchQuery(req, {
      professorId: professor.id,
      response: InvitationResponse.PENDING,
    });
    await InvitationController.query(req, res);
  }
}
