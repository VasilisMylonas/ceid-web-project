import { StatusCodes } from "http-status-codes";
import db from "../models/index.js";
import { deleteIfExists, getFilePath } from "../config/file-storage.js";
import { Op, Sequelize } from "sequelize";
import { ThesisStatus } from "../constants.js";
import { omit } from "../util.js";

export default class TopicController {
  static async query(req, res) {
    let query = {
      attributes: ["id", "professorId", "title", "summary"],
      limit: req.query.limit,
      offset: req.query.offset,
      order: [["id", "ASC"]],
      where: {
        ...(req.query.professorId && { professorId: req.query.professorId }),
      },
    };

    // Filter by status
    if (req.query.status) {
      query.include = [
        {
          model: db.Thesis,
          attributes: [],
          required: false,
        },
      ];

      query.where[Op.or] = [
        Sequelize.where(Sequelize.col("Theses.status"), {
          [req.query.status === "assigned" ? Op.in : Op.notIn]: [
            ThesisStatus.UNDER_ASSIGNMENT,
            ThesisStatus.PENDING,
            ThesisStatus.ACTIVE,
            ThesisStatus.COMPLETED,
            ThesisStatus.UNDER_EXAMINATION,
          ],
        }),
      ];

      // Unassigned topics may also have no theses at all
      if (req.query.status === "unassigned") {
        query.where[Op.or].push(
          Sequelize.where(Sequelize.col("Theses.status"), {
            [Op.is]: null,
          })
        );
      }
    }

    const topics = await db.Topic.findAll(query);
    res.status(StatusCodes.OK).json(topics);
  }

  static async post(req, res) {
    const { title, summary } = req.body;
    const professor = await req.user.getProfessor();

    const thesisTopic = await db.Topic.create({
      title,
      summary,
      professorId: professor.id,
    });

    res.status(StatusCodes.CREATED).json(thesisTopic);
  }

  static async get(req, res) {
    // TODO: does not omit descriptionFile
    res.status(StatusCodes.OK).json(omit(req.topic.get(), "descriptionFile"));
  }

  static async getDescription(req, res) {
    if (!req.topic.descriptionFile) {
      return res.status(StatusCodes.NOT_FOUND).json();
    }

    res.status(StatusCodes.OK).sendFile(getFilePath(req.topic.descriptionFile));
  }

  static async putDescription(req, res) {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json();
    }

    if (req.topic.isAssigned()) {
      return res.status(StatusCodes.BAD_REQUEST).json();
    }

    deleteIfExists(req.topic.descriptionFile);
    req.topic.descriptionFile = req.file.filename;
    await req.topic.save();

    res.status(StatusCodes.NO_CONTENT).json();
  }

  static async put(req, res) {
    const { title, summary } = req.body;

    if (req.topic.isAssigned()) {
      return res.status(StatusCodes.BAD_REQUEST).json();
    }

    await req.topic.update({ title, summary });
    res.status(StatusCodes.OK).json(req.topic);
  }

  static async delete(req, res) {
    if (req.topic.isAssigned()) {
      return res.status(StatusCodes.BAD_REQUEST).json();
    }

    await req.topic.destroy();
    res.status(StatusCodes.NO_CONTENT).json();
  }
}
