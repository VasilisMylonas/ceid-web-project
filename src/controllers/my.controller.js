import { omit } from "../util.js";
import { InvitationResponse } from "../constants.js";
import db from "../models/index.js";
import UserService from "../services/user.service.js";
import TopicService from "../services/topic.service.js";
import ThesisService from "../services/thesis.service.js";

export default class MyController {
  static async getTopics(req, res) {
    const professor = await req.user.getProfessor();

    const topics = await TopicService.query({
      limit: req.query.limit,
      offset: req.query.offset,
      status: req.query.status,
      professorId: professor.professorId,
    });

    res.success(topics.rows, {
      count: topics.rows.length,
      total: topics.count,
    });
  }

  static async getTheses(req, res) {
    const professor = await req.user.getProfessor();
    const theses = await ThesisService.query({
      professorId: professor.id,
      ...req.query,
    });
    res.success(theses.results, {
      count: theses.results.length,
      total: theses.total,
    });
  }

  static async getProfile(req, res) {
    const user = await UserService.get(req.user.id);
    res.success(omit(user.get(), "password"));
  }

  static async patchProfile(req, res) {
    const user = await UserService.get(req.user.id);
    user.update(req.body);
    res.success(omit(user.get(), "password"));
  }

  static async getStats(req, res) {
    const professor = await req.user.getProfessor();

    const rawQuery = `
    SELECT
    COALESCE(CAST(AVG(theses.end_date - theses.start_date) FILTER (WHERE cm.role = 'supervisor') AS FLOAT), 0) AS "avgCompletionDaysSupervised",
    COALESCE(CAST(AVG(theses.end_date - theses.start_date) AS FLOAT), 0) AS "avgCompletionDays",
    COALESCE(CAST(AVG(theses.grade) FILTER (WHERE cm.role = 'supervisor') AS FLOAT), 0) AS "avgGradeSupervised",
    COALESCE(CAST(AVG(theses.grade) AS FLOAT), 0) AS "avgGrade",
    CAST(COUNT(*) FILTER (WHERE cm.role = 'supervisor') AS INTEGER) AS "totalSupervised",
    CAST(COUNT(*) AS INTEGER) AS "total"
    FROM theses
    JOIN committee_members cm ON theses.id = cm.thesis_id
    JOIN professors prof ON cm.professor_id = prof.id
    WHERE prof.id = :professorId AND theses.status = 'completed';
    `;

    // TODO: test this

    const [results] = await db.sequelize.query(rawQuery, {
      replacements: { professorId: professor.id },
    });

    return res.success(results[0]);
  }

  static async getThesis(req, res) {
    // TODO: maybe we should only return not cancelled theses?
    const student = await req.user.getStudent();
    const theses = await ThesisService.query({
      studentId: student.id,
    });
    res.success(theses.results, {
      count: theses.results.length,
      total: theses.total,
    });
  }

  static async getInvitations(req, res) {
    const professor = await req.user.getProfessor();
    const invitations = await professor.getInvitations({
      where: {
        professorId: professor.id,
        response: InvitationResponse.PENDING,
      },
    });

    res.success(invitations, {
      count: invitations.length,
      total: invitations.length,
    });
  }
}
