import db from "../models/index.js";
import { Op, Sequelize } from "sequelize";
import { ThesisStatus } from "../constants.js";
import { NotFoundError, SecurityError, ConflictError } from "../errors.js";
import { getFilePath, deleteIfExists } from "../config/file-storage.js";

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

  static async get(id) {
    const topic = await db.Topic.findByPk(id);
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }
    return topic;
  }

  static async create(user, { title, summary }) {
    const professor = await user.getProfessor();
    // We do not check role here, cause we have middleware
    return professor.createTopic({ title, summary });
  }

  static async _assertProfessorOwnsTopic(id, user) {
    const topic = await TopicService.get(id);
    const professor = await user.getProfessor();
    if (!professor || topic.professorId !== professor.id) {
      throw new SecurityError("You are not the owner of this topic");
    }
    return topic;
  }

  static async update(id, user, data) {
    const topic = await TopicService._assertProfessorOwnsTopic(id, user);
    await topic.update(data);
    return topic;
  }

  static async delete(id, user) {
    const topic = await TopicService._assertProfessorOwnsTopic(id, user);
    if (await topic.isAssigned()) {
      throw new ConflictError("Cannot delete an assigned topic");
    }
    await topic.destroy();
  }

  static async setDescriptionFile(id, user, filename) {
    const topic = await TopicService._assertProfessorOwnsTopic(id, user);
    deleteIfExists(topic.descriptionFile);
    await topic.update({ descriptionFile: filename });
  }

  static async clearDescriptionFile(id, user) {
    const topic = await TopicService._assertProfessorOwnsTopic(id, user);
    deleteIfExists(topic.descriptionFile);
    await topic.update({ descriptionFile: null });
  }

  static async getDescription(id) {
    const topic = await TopicService.get(id);
    if (!topic.descriptionFile) {
      throw new NotFoundError("No description file");
    }
    return getFilePath(topic.descriptionFile);
  }
}
