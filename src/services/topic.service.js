import db from "../models/index.js";
import { Op, Sequelize } from "sequelize";
import { ThesisStatus } from "../constants.js";
import { NotFoundError } from "../errors.js";

export default class TopicService {
  static async query({ limit, offset, professorId, status }) {
    let query = {
      attributes: ["id", "professorId", "title", "summary"],
      limit,
      offset,
      order: [["id", "ASC"]],
      where: {
        ...(professorId && { professorId }),
      },
    };

    if (status) {
      query.include = [
        {
          model: db.Thesis,
          attributes: [],
          required: false,
        },
      ];

      query.where[Op.or] = [
        Sequelize.where(Sequelize.col("Theses.status"), {
          [status === "assigned" ? Op.in : Op.notIn]: [
            ThesisStatus.UNDER_ASSIGNMENT,
            ThesisStatus.ACTIVE,
            ThesisStatus.COMPLETED,
            ThesisStatus.UNDER_EXAMINATION,
          ],
        }),
      ];

      if (status === "unassigned") {
        query.where[Op.or].push(
          Sequelize.where(Sequelize.col("Theses.status"), {
            [Op.is]: null,
          })
        );
      }
    }

    return db.Topic.findAndCountAll(query);
  }

  static async create({ title, summary, professor }) {
    return await professor.createTopic({ title, summary });
  }

  static async get(topicId) {
    const topic = await db.Topic.findByPk(topicId);
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }
    return topic;
  }
}
