import { StatusCodes } from "http-status-codes";
import db from "../models/index.js";
import ThesisService from "../services/thesis.service.js";

export default class ThesisController {
  static async post(req, res) {
    const thesis = await ThesisService.create({
      topicId: req.body.topicId,
      studentId: req.body.studentId,
    });
    res.success(thesis);
  }

  static async query(req, res) {
    const { results, total } = await ThesisService.query({
      studentId: req.query.studentId,
      status: req.query.status,
      topicId: req.query.topicId,
      professorId: req.query.professorId,
      role: req.query.role,
      q: req.query.q,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    res.success(results, { count: results.length, total });
  }

  static async get(req, res) {
    const thesis = await ThesisService.getExtra(req.params.id, req.user);
    res.success(thesis);
  }

  static async delete(req, res) {
    await ThesisService.delete(req.params.id, req.user);
    res.success();
  }

  static async putNemertesLink(req, res) {
    const nemertesLink = await ThesisService.setNemertesLink(
      req.params.id,
      req.user,
      req.body.nemertesLink
    );
    res.success({ nemertesLink });
  }

  static async putGrading(req, res) {
    const grading = await ThesisService.setGrading(
      req.params.id,
      req.user,
      req.body.grading
    );
    res.success({ grading });
  }

  static async getDraft(req, res) {
    const filePath = await ThesisService.getDraftFile(req.params.id, req.user);
    res.status(StatusCodes.OK).sendFile(filePath);
  }

  static async putDraft(req, res) {
    if (!req.file) {
      return res.error("No file uploaded", StatusCodes.BAD_REQUEST);
    }
    await ThesisService.setDraftFile(
      req.params.id,
      req.user,
      req.file.filename
    );
    res.success();
  }

  static async cancel(req, res) {
    await ThesisService.cancel(req.params.id, req.user, {
      assemblyYear: req.body.assemblyYear,
      assemblyNumber: req.body.assemblyNumber,
      cancellationReason: req.body.cancellationReason,
    });
    res.success(null, {}, StatusCodes.OK);
  }

  static async complete(req, res) {
    await ThesisService.complete(req.params.id, req.user);
    res.success(null, {}, StatusCodes.OK);
  }

  static async putStatus(req, res) {
    // TODO: this is wrong
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
  }

  static async getNotes(req, res) {
    const professor = await req.user.getProfessor();
    const notes = await req.thesis.getNotes({
      where: { professorId: professor.id },
      order: [["id", "ASC"]],
    });

    res.success(notes, { count: notes.length, total: notes.length });
  }

  static async postNote(req, res) {
    const professor = await req.user.getProfessor();
    const note = await db.Note.create({
      thesisId: req.thesis.id,
      professorId: professor.id,
      content: req.body.content,
    });
    res.success(note);
  }

  static async getInvitations(req, res) {
    const invitations = await req.thesis.getInvitations({
      order: [["id", "ASC"]],
    });
    res.status(StatusCodes.OK).json(invitations);
  }

  static async postInvitation(req, res) {
    const invitations = await db.Invitation.findAll({
      where: {
        thesisId: req.thesis.id,
        professorId: req.body.professorId,
      },
    });

    if (invitations.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "An identical invitation already exists.",
      });
    }

    const invitation = await db.Invitation.create({
      thesisId: req.thesis.id,
      professorId: req.body.professorId,
    });
    res.status(StatusCodes.CREATED).json(invitation);
  }

  static async getResources(req, res) {
    const resources = await req.thesis.getResources({
      order: [["id", "ASC"]],
    });
    res.success(resources, {
      count: resources.length,
      total: resources.length,
    });
  }

  static async getPresentations(req, res) {
    const presentations = await req.thesis.getPresentations({
      order: [["id", "ASC"]],
    });
    res.success(presentations, {
      count: presentations.length,
      total: presentations.length,
    });
  }

  static async postResource(req, res) {
    const resource = await db.Resource.create({
      thesisId: req.thesis.id,
      link: req.body.link,
      type: req.body.type,
    });

    res.success(resource);
  }

  static async postPresentation(req, res) {
    // TODO: maybe check for overlapping presentations?

    const presentation = await db.Presentation.create({
      thesisId: req.thesis.id,
      date: req.body.date,
      kind: req.body.kind,
      hall: req.body.hall,
      link: req.body.link,
    });

    res.success(presentation);
  }
}
