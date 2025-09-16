import { patchQuery } from "../util.js";
import TopicController from "./topic.controller.js";
import ThesisController from "./thesis.controller.js";
import InvitationController from "./invitation.controller.js";
import UserController from "./user.controller.js";
import { InvitationResponse, ThesisRole } from "../constants.js";
import db from "../models/index.js";

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

  static async getProfile(req, res) {
    req.params.id = req.user.id;
    req.targetUser = req.user;
    await UserController.get(req, res);
  }

  static async patchProfile(req, res) {
    req.params.id = req.user.id;
    req.targetUser = req.user;
    await UserController.patch(req, res);
  }

  static async deleteProfile(req, res) {
    req.params.id = req.user.id;
    req.targetUser = req.user;
    await UserController.delete(req, res);
  }

  static async getThesis(req, res) {
    const student = await req.user.getStudent();
    req = patchQuery(req, { studentId: student.id });
    await ThesisController.query(req, res);
  }

  static async getStats(req, res) {
    const professor = await req.user.getProfessor();

    const rawQuery = `
    SELECT
    AVG(theses.end_date - theses.start_date) FILTER (WHERE cm.role = 'supervisor') AS "avgCompletionDaysSupervised",
    AVG(theses.end_date - theses.start_date) AS "avgCompletionDays",
    AVG(theses.grade) FILTER (WHERE cm.role = 'supervisor') AS "avgGradeSupervised",
    AVG(theses.grade) AS "avgGrade",
    COUNT(*) FILTER (WHERE cm.role = 'supervisor') AS "totalSupervised",
    COUNT(*) AS "total"
    FROM theses
    JOIN committee_members cm ON theses.id = cm.thesis_id
    JOIN professors prof ON cm.professor_id = prof.id
    WHERE prof.id = :professorId AND theses.status = 'completed';
    `;

    const [results, _] = await db.sequelize.query(rawQuery, {
      replacements: { professorId: professor.id },
    });

    return res.success(results);
  }
}
