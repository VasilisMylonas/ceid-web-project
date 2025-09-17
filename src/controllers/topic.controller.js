import { StatusCodes } from "http-status-codes";
import TopicService from "../services/topic.service.js";
import { omit } from "../util.js";

export default class TopicController {
  static async query(req, res) {
    const topics = await TopicService.query({
      limit: req.query.limit,
      offset: req.query.offset,
      professorId: req.query.professorId,
      status: req.query.status,
    });
    res.success(topics.rows, {
      count: topics.rows.length,
      total: topics.count,
    });
  }

  static async post(req, res) {
    const { title, summary } = req.body;
    const topic = await TopicService.create({
      title,
      summary,
      user: req.user,
    });
    res.success(omit(topic.get(), "descriptionFile"));
  }

  static async get(req, res) {
    const topic = await TopicService.get(req.params.id);
    res.success(omit(topic.get(), "descriptionFile"));
  }

  static async put(req, res) {
    const topic = await TopicService.update({
      topicId: req.params.id,
      user: req.user,
      data: req.body,
    });
    res.success(omit(topic.get(), "descriptionFile"));
  }

  static async delete(req, res) {
    await TopicService.delete({
      topicId: req.params.id,
      user: req.user,
    });
    res.success();
  }

  static async getDescription(req, res) {
    const filePath = await TopicService.getDescription(req.params.id);
    res.status(StatusCodes.OK).sendFile(filePath);
  }

  static async putDescription(req, res) {
    if (!req.file) {
      return res.error("No file uploaded", StatusCodes.BAD_REQUEST);
    }
    await TopicService.setDescriptionFile({
      topicId: req.params.id,
      user: req.user,
      filename: req.file.filename,
    });
    res.success();
  }

  static async deleteDescription(req, res) {
    await TopicService.clearDescriptionFile({
      topicId: req.params.id,
      user: req.user,
    });
    res.success();
  }
}
