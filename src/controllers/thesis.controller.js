import { StatusCodes } from "http-status-codes";
import {
  CommitteeMember,
  Note,
  Thesis,
  Resource,
  Presentation,
  Topic,
  Student,
} from "../models/index.js";
import { getFilePath, deleteIfExists } from "../config/file-storage.js";

export default class ThesisController {
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

  static async get(req, res) {
    const thesis = req.thesis.toJSON();
    delete thesis.documentFile;
    res.status(StatusCodes.OK).json(thesis);
  }

  static async post(req, res) {
    const topic = await Topic.findByPk(req.body.topicId);
    const student = await Student.findByPk(req.body.studentId);

    if (!topic || !student) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }

    try {
      const thesis = await Thesis.createFrom({
        topic: topic,
        student: student,
      });
      res.status(StatusCodes.CREATED).json(thesis);
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  }

  static async patch(req, res) {
    await req.thesis.update(req.body);
    res.status(StatusCodes.OK).json(req.thesis);
  }

  static async delete(req, res) {
    if (!(await req.thesis.canBeDeleted())) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Thesis cannot be deleted at this stage.",
      });
    }

    CommitteeMember.destroy({
      where: { thesisId: req.thesis.id },
    });

    await req.thesis.destroy();
    res.status(StatusCodes.NO_CONTENT).send();
  }

  static async putDocument(req, res) {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).send();
    }

    deleteIfExists(req.thesis.documentFile);
    req.thesis.documentFile = req.file.filename;
    await req.thesis.save();

    res.status(StatusCodes.CREATED).send();
  }

  static async getDocument(req, res) {
    if (!req.thesis.documentFile) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    res.sendFile(getFilePath(req.thesis.documentFile));
  }

  static async getTimeline(req, res) {
    // TODO
  }

  static async getNotes(req, res) {
    const notes = await Note.findAll({
      where: { thesisId: req.thesis.id },
      order: [["id", "ASC"]],
    });
    res.status(StatusCodes.OK).json(notes);
  }

  static async getResources(req, res) {
    const resources = await Resource.findAll({
      order: [["id", "ASC"]],
    });
    res.status(StatusCodes.OK).json(resources);
  }

  static async getPresentations(req, res) {
    const presentations = await Presentation.findAll({
      order: [["id", "ASC"]],
    });
    res.status(StatusCodes.OK).json(presentations);
  }

  static async getInvitations(req, res) {
    // TODO
  }

  static async postNotes(req, res) {
    // TODO
  }

  static async postResources(req, res) {
    // TODO
  }

  static async postPresentations(req, res) {
    // TODO
  }

  static async postInvitations(req, res) {
    // TODO
  }
}
