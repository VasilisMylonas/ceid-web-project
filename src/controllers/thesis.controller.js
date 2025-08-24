import { StatusCodes } from "http-status-codes";
import {
  CommitteeMember,
  Note,
  Thesis,
  Resource,
  Presentation,
  Topic,
  Student,
  Invitation,
} from "../models/index.js";
import { getFilePath, deleteIfExists } from "../config/file-storage.js";
import { ThesisStatus } from "../constants.js";
import { SourceCode } from "eslint";

export default class ThesisController {
  static async post(req, res) {
    const topic = await Topic.findByPk(req.body.topicId);
    const student = await Student.findByPk(req.body.studentId);

    if (!topic) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "No such topic." });
    }

    if (!student) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "No such student." });
    }

    try {
      const thesis = await Thesis.createFrom({
        topic: topic,
        student: student,
      });
      res.status(StatusCodes.CREATED).json(thesis);
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    if (!req.isSupervisor) {
      // TODO: secretary can also delete
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Only the supervisor can delete the thesis.",
      });
    }

    if (!(await req.thesis.canBeDeleted())) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thesis cannot be deleted at this stage.",
      });
    }

    CommitteeMember.destroy({
      where: { thesisId: req.thesis.id },
    });
    Invitation.destroy({
      where: { thesisId: req.thesis.id },
    });

    await req.thesis.destroy();
    return res.status(StatusCodes.NO_CONTENT).send();
  }

  static async getNotes(req, res) {
    const notes = await req.thesis.getNotes({
      where: { professorId: req.user.id },
      order: [["id", "ASC"]],
    });
    res.status(StatusCodes.OK).json(notes);
  }

  static async postNote(req, res) {
    if (req.body.content.length > 300) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Note exceeds 300 characters." });
    }
    const note = await Note.create({
      thesisId: req.thesis.id,
      professorId: req.user.id,
      content: req.body.content,
    });
    res.status(StatusCodes.CREATED).json(note);
  }

  static async getInvitations(req, res) {
    const invitations = await req.thesis.getInvitations({
      order: [["id", "ASC"]],
    });
    res.status(StatusCodes.OK).json(invitations);
  }

  static async postInvitation(req, res) {
    const invitations = await Invitation.findAll({
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

    const invitation = await Invitation.create({
      thesisId: req.thesis.id,
      professorId: req.body.professorId,
    });
    res.status(StatusCodes.CREATED).json(invitation);
  }

  static async cancel(req, res) {
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

    return res.status(StatusCodes.OK).send(req.thesis);
  }

  static async patchStatus(req, res) {
    if (req.body.status === ThesisStatus.UNDER_EXAMINATION) {
      if (req.thesis.status !== ThesisStatus.ACTIVE) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Thesis is not active." });
      }

      req.thesis.status = ThesisStatus.UNDER_EXAMINATION;
      await req.thesis.save();

      return res.status(StatusCodes.OK).send(req.thesis);
    }

    if (req.body.status === ThesisStatus.COMPLETED) {
      if (req.thesis.status !== ThesisStatus.UNDER_EXAMINATION) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Thesis is not under examination.",
        });
      }

      req.thesis.status = ThesisStatus.COMPLETED;
      req.thesis.endDate = new Date();
      await req.thesis.save();

      return res.status(StatusCodes.OK).send(req.thesis);
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }

  static async getDraft(req, res) {
    if (!req.thesis.documentFile) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    res.status(SourceCode.OK).sendFile(getFilePath(req.thesis.documentFile));
  }

  static async putDraft(req, res) {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).send();
    }

    if (!req.thesis.status === ThesisStatus.ACTIVE) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Thesis is not active." });
    }

    deleteIfExists(req.thesis.documentFile);
    req.thesis.documentFile = req.file.filename;
    await req.thesis.save();

    res.status(StatusCodes.NO_CONTENT).send();
  }

  // TODO
  static async query(req, res) {
    let query = {
      attributes: ["id", "status", "topicId", "studentId"],
      limit: req.query.limit,
      offset: req.query.offset,
      order: [["id", "ASC"]],
      where: {
        ...(req.query.studentId && { studentId: req.query.studentId }),
        ...(req.query.status && { status: req.query.status }),
        ...(req.query.topicId && { topicId: req.query.topicId }),
      },
    };

    if (req.query.professorId) {
      query.include = [
        {
          model: CommitteeMember,
          attributes: [],
          where: {
            professorId: req.query.professorId,
            ...(req.query.role && { role: req.query.role }),
          },
        },
      ];
    }

    const theses = await Thesis.findAll(query);
    res.status(StatusCodes.OK).json(theses);
  }

  // TODO
  static async get(req, res) {
    const thesis = req.thesis.toJSON();
    delete thesis.documentFile;
    res.status(StatusCodes.OK).json(thesis);
  }

  static async getResources(req, res) {
    const resources = await req.thesis.getResources({
      order: [["id", "ASC"]],
    });
    res.status(StatusCodes.OK).json(resources);
  }

  static async getPresentations(req, res) {
    const presentations = await req.thesis.getPresentations({
      order: [["id", "ASC"]],
    });
    res.status(StatusCodes.OK).json(presentations);
  }

  static async postResource(req, res) {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).send();
    }

    const resource = await Resource.create({
      thesisId: req.thesis.id,
      link: req.body.link,
      type: req.body.type,
    });

    res.status(StatusCodes.CREATED).json(resource);
  }

  static async postPresentation(req, res) {
    const presentation = await Presentation.create({
      thesisId: req.thesis.id,
      date: req.body.date,
      kind: req.body.kind,
      hall: req.body.hall,
      link: req.body.link,
    });

    res.status(StatusCodes.CREATED).json(presentation);
  }
}
