import { StatusCodes } from "http-status-codes";
import TopicService from "../services/topic.service.js";
import { omit } from "../util.js";
import { SecurityError } from "../errors.js";

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

    const professor = await req.user.getProfessor();
    const topic = await professor.createTopic({ title, summary });
    res.success(omit(topic.get(), "descriptionFile"));
  }

  static async get(req, res) {
    const topic = await TopicService.get(req.params.id);
    res.success(omit(topic.get(), "descriptionFile"));
  }

  static async _assertProfessorOwnsTopic(req) {
    const topic = await TopicService.get(req.params.id);
    const professor = await req.user.getProfessor();
    if (!professor || topic.professorId !== professor.id) {
      throw new SecurityError("You are not the owner of this topic");
    }
    return topic;
  }

  static async put(req, res) {
    const topic = await TopicController._assertProfessorOwnsTopic(req);
    await topic.update(req.body);
    res.success(omit(topic.get(), "descriptionFile"));
  }

  static async delete(req, res) {
    const topic = await TopicController._assertProfessorOwnsTopic(req);
    await topic.destroy();
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

    const topic = await TopicController._assertProfessorOwnsTopic(req);
    topic.descriptionFile = req.file.filename;
    await topic.save();
    res.success();
  }

  static async deleteDescription(req, res) {
    const topic = await TopicController._assertProfessorOwnsTopic(req);
    topic.descriptionFile = null;
    await topic.save();
    res.success();
  }
}
