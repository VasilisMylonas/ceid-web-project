import { StatusCodes } from "http-status-codes";
import { Topic } from "../models/index.js";

export async function queryTopics(req, res) {
  let query = {
    attributes: ["id", "professorId", "title", "summary"],
    limit: req.query.limit,
    offset: req.query.offset,
  };

  if (req.query.professor) {
    query.where = {
      professorId: req.query.professor,
    };
  }

  const topics = await Topic.findAll(query);
  res.status(StatusCodes.OK).json(topics);
}

export async function postTopic(req, res) {
  const { title, summary } = req.body;

  const thesisTopic = await Topic.create({
    title,
    summary,
    professorId: req.userId,
  });

  res.status(StatusCodes.CREATED).json(thesisTopic);
}

export async function getTopic(req, res) {
  // TODO: Not implemented
  res.status(StatusCodes.IM_A_TEAPOT).send();
}

export async function patchTopic(req, res) {
  const topic = await Topic.findByPk(req.params.id);

  if (!topic) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }

  await topic.update(req.body);

  res.status(StatusCodes.CREATED).json(topic);
}
