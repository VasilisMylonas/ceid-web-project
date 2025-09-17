import { omit, patchQuery } from "../util.js";
import ThesisController from "./thesis.controller.js";
import InvitationController from "./invitation.controller.js";
import { InvitationResponse } from "../constants.js";
import db from "../models/index.js";
import UserService from "../services/user.service.js";
import { StatusCodes } from "http-status-codes";
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

  static async deleteProfile(req, res) {
    // TODO WONTFIX: delete user dependencies (professor, secretary, student)
    res.error("Not implemented", StatusCodes.NOT_IMPLEMENTED);
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

    // TODO

    return res.success(results);
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

  // TODO: These mainly forward to appropriate controllers with patched queries
  static async getInvitations(req, res) {
    const professor = await req.user.getProfessor();
    req = patchQuery(req, {
      professorId: professor.id,
      response: InvitationResponse.PENDING,
    });
    await InvitationController.query(req, res);
  }
}
