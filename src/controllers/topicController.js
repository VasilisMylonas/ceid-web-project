import { StatusCodes } from "http-status-codes";
import Topic from "../models/Topic.js";

export async function createTopic(req, res) {
  const { title, summary } = req.body;

  if (!title || !summary) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send("title or summary not provided");
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
  try {
    const topics = await Topic.findAll({ where: { userId: req.auth.id } });
    res.status(StatusCodes.OK).json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}
