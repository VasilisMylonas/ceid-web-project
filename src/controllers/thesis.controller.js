import { StatusCodes } from "http-status-codes";
import db from "../models/index.js";
import { getFilePath, deleteIfExists } from "../config/file-storage.js";
import { ThesisStatus, UserRole } from "../constants.js";
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
    const thesis = await ThesisService.getExtra(req.params.id);
    res.success(thesis);
  }

  static async delete(req, res) {
    await ThesisService.delete(req.params.id);
    res.success();
  }

  static async patchGrading(req, res) {
    await req.thesis.update({ grading: req.body.grading });
    res.status(StatusCodes.OK).json(req.thesis);
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

  static async cancel(req, res) {
    // TODO: this is wrong
    const thesis = req.thesis;

    if (thesis.status !== ThesisStatus.ACTIVE) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Thesis cannot be cancelled at this stage." });
    }

    const startDate = thesis.startDate;
    const now = new Date();
    const diffYears = (now - startDate) / (1000 * 60 * 60 * 24 * 365.25);

    if (diffYears < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Cannot cancel thesis before 2 years from start date.",
      });
    }

    thesis.status = ThesisStatus.CANCELLED;
    thesis.endDate = now;

    await thesis.save();

    return res.status(StatusCodes.OK).json(req.thesis);
  }

  static async patchStatus(req, res) {
    // TODO: this is wrong

    switch (req.body.status) {
      case ThesisStatus.UNDER_EXAMINATION: {
        if (req.user.role !== UserRole.PROFESSOR) {
          return res.status(StatusCodes.FORBIDDEN).json({
            message: "Only professors can set thesis under examination.",
          });
        }

        if (req.thesis.status !== ThesisStatus.ACTIVE) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Thesis is not active." });
        }

        req.thesis.status = ThesisStatus.UNDER_EXAMINATION;
        await req.thesis.save();

        return res.status(StatusCodes.OK).json(req.thesis);
      }
      case ThesisStatus.COMPLETED: {
        if (req.user.role !== UserRole.SECRETARY) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "Only secretaries can complete theses." });
        }

        if (req.thesis.status !== ThesisStatus.UNDER_EXAMINATION) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Thesis is not under examination.",
          });
        }

        req.thesis.status = ThesisStatus.COMPLETED;
        req.thesis.endDate = new Date();
        await req.thesis.save();

        return res.status(StatusCodes.OK).json(req.thesis);
      }
      case ThesisStatus.REJECTED: {
        if (req.user.role !== UserRole.SECRETARY) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "Only secretaries can review theses." });
        }

        if (req.thesis.status !== ThesisStatus.PENDING) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Thesis is not pending review.",
          });
        }

        req.thesis.status = ThesisStatus.REJECTED;
        await req.thesis.save();

        return res.status(StatusCodes.OK).json(req.thesis);
      }
      case ThesisStatus.ACTIVE: {
        if (req.user.role !== UserRole.SECRETARY) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "Only secretaries can review theses." });
        }

        if (req.thesis.status !== ThesisStatus.PENDING) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Thesis is not pending review.",
          });
        }

        req.thesis.status = ThesisStatus.ACTIVE;
        req.thesis.startDate = new Date();
        await req.thesis.save();

        return res.status(StatusCodes.OK).json(req.thesis);
      }
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
  }

  static async getDraft(req, res) {
    if (!req.thesis.documentFile) {
      return res.status(StatusCodes.NOT_FOUND).json();
    }
    res.status(StatusCodes.OK).sendFile(getFilePath(req.thesis.documentFile));
  }

  static async putDraft(req, res) {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json();
    }

    if (!req.thesis.status === ThesisStatus.ACTIVE) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Thesis is not active." });
    }

    deleteIfExists(req.thesis.documentFile);
    req.thesis.documentFile = req.file.filename;
    await req.thesis.save();

    res.status(StatusCodes.NO_CONTENT).json();
  }

  static async putNemertesLink(req, res) {
    if (req.thesis.status !== ThesisStatus.UNDER_EXAMINATION) {
      return res.error("Thesis is not under examination.");
    }

    await req.thesis.update({ nemertesLink: req.body.nemertesLink });

    res.success({
      nemertesLink: req.thesis.nemertesLink,
    });
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
