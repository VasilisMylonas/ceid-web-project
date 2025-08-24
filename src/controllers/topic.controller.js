import { StatusCodes } from "http-status-codes";
import { Topic, Thesis } from "../models/index.js";
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

    if (req.query.status === "assigned") {
      query.include = [
        {
          model: Thesis,
          attributes: [],
        },
      ];

      query.where[Op.or] = [
        Sequelize.where(Sequelize.col("theses.status"), {
          [Op.in]: [
            ThesisStatus.UNDER_ASSIGNMENT,
            ThesisStatus.PENDING,
            ThesisStatus.ACTIVE,
            ThesisStatus.COMPLETED,
            ThesisStatus.UNDER_EXAMINATION,
          ],
        }),
      ];
    }

    if (req.query.status === "unassigned") {
      query.include = [
        {
          model: Thesis,
          attributes: [],
          required: false,
        },
      ];

      query.where[Op.or] = [
        Sequelize.where(Sequelize.col("theses.status"), {
          [Op.in]: [ThesisStatus.CANCELLED, ThesisStatus.REJECTED],
        }),
        Sequelize.where(Sequelize.col("theses.id"), {
          [Op.is]: null,
        }),
      ];
    }

    // Keyword searching
    if (req.query.keywords) {
      const keywords = req.query.keywords
        .split(" ")
        .filter(Boolean)
        .map((k) => `%${k}%`);

      if (keywords.length > 0) {
        query.where[Op.or] = [
          {
            title: {
              [Op.iLike]: { [Op.any]: keywords },
            },
          },
          {
            summary: {
              [Op.iLike]: { [Op.any]: keywords },
            },
          },
        ];
      }
    }

    const topics = await Topic.findAll(query);
    res.status(StatusCodes.OK).json(topics);
  }

  static async post(req, res) {
    const { title, summary } = req.body;
    const professor = await req.user.getProfessor();

    const thesisTopic = await Topic.create({
      title,
      summary,
      professorId: professor.id,
    });

    res.status(StatusCodes.CREATED).json(thesisTopic);
  }

  static async get(req, res) {
    res.status(StatusCodes.OK).json(omit(req.topic.get(), "descriptionFile"));
  }

  static async getDescription(req, res) {
    if (!req.topic.descriptionFile) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }

    res.status(StatusCodes.OK).sendFile(getFilePath(req.topic.descriptionFile));
  }

  static async putDescription(req, res) {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).send();
    }

    if (req.topic.isAssigned()) {
      return res.status(StatusCodes.BAD_REQUEST).send();
    }

    deleteIfExists(req.topic.descriptionFile);
    req.topic.descriptionFile = req.file.filename;
    await req.topic.save();

    res.status(StatusCodes.NO_CONTENT).send();
  }

  static async put(req, res) {
    const { title, summary } = req.body;

    if (req.topic.isAssigned()) {
      return res.status(StatusCodes.BAD_REQUEST).send();
    }

    await req.topic.update({ title, summary });
    res.status(StatusCodes.OK).json(req.topic);
  }

  static async delete(req, res) {
    if (req.topic.isAssigned()) {
      return res.status(StatusCodes.BAD_REQUEST).send();
    }

    await req.topic.destroy();
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
