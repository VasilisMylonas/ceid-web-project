import { StatusCodes } from "http-status-codes";
import ThesisService from "../services/thesis.service.js";

export default class ThesisController {
  static async post(req, res) {
    const thesis = await ThesisService.create(req.user, {
      topicId: req.body.topicId,
      studentId: req.body.studentId,
    });
    res.success(thesis, {}, StatusCodes.CREATED);
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

  static async examine(req, res) {
    const status = await ThesisService.examine(req.params.id, req.user);
    res.success({ status });
  }

  static async approve(req, res) {
    const status = await ThesisService.approve(req.params.id, req.user, {
      assemblyNumber: req.body.assemblyNumber,
      protocolNumber: req.body.protocolNumber,
    });
    res.success({ status });
  }

  static async cancel(req, res) {
    const status = await ThesisService.cancel(req.params.id, req.user, {
      assemblyNumber: req.body.assemblyNumber,
      cancellationReason: req.body.cancellationReason,
    });
    res.success({ status });
  }

  static async complete(req, res) {
    const status = await ThesisService.complete(req.params.id, req.user);
    res.success({ status });
  }

  static async getGrades(req, res) {
    const grades = await ThesisService.getGrades(req.params.id, req.user);
    res.success(grades);
  }

  static async putGrade(req, res) {
    const grades = await ThesisService.setGrade(
      req.params.id,
      req.user,
      req.body
    );
    res.success(grades, {}, StatusCodes.CREATED);
  }

  static async getNotes(req, res) {
    const notes = await ThesisService.getNotes(req.params.id, req.user);
    res.success(notes, { count: notes.length, total: notes.length });
  }

  static async postNote(req, res) {
    const note = await ThesisService.createNote(
      req.params.id,
      req.user,
      req.body.content
    );
    res.success(note, {}, StatusCodes.CREATED);
  }

  static async announce(req, res) {
    await ThesisService.announce(req.params.id, req.user, req.body.content);
    res.success();
  }

  static async getAnnouncement(req, res) {
    const announcement = await ThesisService.getAnnouncement(
      req.params.id,
      req.user
    );
    res.success(announcement);
  }

  static async getInvitations(req, res) {
    const invitations = await ThesisService.getInvitations(
      req.params.id,
      req.user
    );
    res.success(invitations, {
      count: invitations.length,
      total: invitations.length,
    });
  }

  static async postInvitation(req, res) {
    const invitation = await ThesisService.createInvitation(
      req.params.id,
      req.user,
      req.body.professorId
    );
    res.success(invitation, {}, StatusCodes.CREATED);
  }

  static async getResources(req, res) {
    const resources = await ThesisService.getResources(req.params.id, req.user);
    res.success(resources, {
      count: resources.length,
      total: resources.length,
    });
  }

  static async getPresentations(req, res) {
    const presentations = await ThesisService.getPresentations(
      req.params.id,
      req.user
    );
    res.success(presentations, {
      count: presentations.length,
      total: presentations.length,
    });
  }

  static async postResource(req, res) {
    const resource = await ThesisService.createResource(
      req.params.id,
      req.user,
      {
        link: req.body.link,
        type: req.body.type,
      }
    );
    res.success(resource, {}, StatusCodes.CREATED);
  }

  static async postPresentation(req, res) {
    const presentation = await ThesisService.createPresentation(
      req.params.id,
      req.user,
      {
        date: req.body.date,
        kind: req.body.kind,
        hall: req.body.hall,
        link: req.body.link,
      }
    );
    res.success(presentation);
  }

  static async getTimeline(req, res) {
    const changes = await ThesisService.getChanges(req.params.id, req.user);
    res.success(changes);
  }
}
