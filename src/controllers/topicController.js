import { StatusCodes } from "http-status-codes";
import Topic from "../models/Topic.js";

export async function createTopic(req, res) {
  const { title, summary } = req.body;

  if (!title || !summary) {
    return res.status(StatusCodes.BAD_REQUEST).send();
  }

  try {
    const topic = await Topic.create({
      title,
      summary,
      userId: req.auth.id,
    });
    res.status(StatusCodes.CREATED).json(topic);
  } catch (error) {
    console.error("Error creating topic:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}

export async function getTopics(req, res) {
  const { owner } = req.query;

  try {
    const topics = owner
      ? await Topic.findAll({ where: { userId: owner } })
      : await Topic.findAll();

    res.status(StatusCodes.OK).json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}

export async function getTopic(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(StatusCodes.BAD_REQUEST).send();
  }

  try {
    const topic = await Topic.findByPk(id);

    if (!topic) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }

    res.status(StatusCodes.OK).json(topic);
  } catch (error) {
    console.error("Error fetching topic:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}
