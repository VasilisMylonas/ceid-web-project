import db from "../models/index.js";
import { Op, Sequelize } from "sequelize";
import { ThesisStatus } from "../constants.js";
import { NotFoundError } from "../errors.js";
import { getFilePath } from "../config/file-storage.js";

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

  static async get(topicId) {
    const topic = await db.Topic.findByPk(topicId);
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }
    return topic;
  }

  static async update(topicId, data) {
    const topic = await TopicService.get(topicId);
    await topic.update(data);
    return topic;
  }

  static async getDescription(topicId) {
    const topic = await TopicService.get(topicId);
    if (!topic.descriptionFile) {
      throw new NotFoundError("No description file");
    }
    return getFilePath(topic.descriptionFile);
  }
}
