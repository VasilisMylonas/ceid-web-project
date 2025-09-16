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

    const topics = await db.Topic.findAndCountAll(query);

    res.success(topics.rows, {
      count: topics.rows.length,
      total: topics.count,
    });
  }

  static async post(req, res) {
    const { title, summary } = req.body;

    const professor = await req.user.getProfessor();
    const topic = await professor.createTopic({
      title,
      summary,
    });

    res.success(omit(topic.get(), "descriptionFile"));
  }

  static async get(req, res) {
    res.success(omit(req.topic.get(), "descriptionFile"));
  }

  static async put(req, res) {
    if (await req.topic.isAssigned()) {
      return res.error(
        "Cannot modify an assigned topic",
        StatusCodes.BAD_REQUEST
      );
    }

    await req.topic.update(req.body);
    res.success(omit(req.topic.get(), "descriptionFile"));
  }

  static async delete(req, res) {
    if (await req.topic.isAssigned()) {
      return res.error(
        "Cannot delete an assigned topic",
        StatusCodes.BAD_REQUEST
      );
    }

    await req.topic.destroy();
    res.success();
  }

  static async getDescription(req, res) {
    if (!req.topic.descriptionFile) {
      return res.error("No description file", StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).sendFile(getFilePath(req.topic.descriptionFile));
  }

  static async putDescription(req, res) {
    if (!req.file) {
      return res.error("No file uploaded", StatusCodes.BAD_REQUEST);
    }

    if (await req.topic.isAssigned()) {
      return res.error(
        "Cannot modify description of an assigned topic",
        StatusCodes.BAD_REQUEST
      );
    }

    deleteIfExists(req.topic.descriptionFile);
    req.topic.descriptionFile = req.file.filename;
    await req.topic.save();

    res.success();
  }

  static async deleteDescription(req, res) {
    if (!req.topic.descriptionFile) {
      return res.error("No description file", StatusCodes.NOT_FOUND);
    }

    if (await req.topic.isAssigned()) {
      return res.error(
        "Cannot delete description of an assigned topic",
        StatusCodes.BAD_REQUEST
      );
    }

    deleteIfExists(req.topic.descriptionFile);
    req.topic.descriptionFile = null;
    await req.topic.save();

    res.success();
  }
}
