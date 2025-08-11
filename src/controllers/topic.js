import { StatusCodes } from "http-status-codes";
import { Topic } from "../models/index.js";
import { deleteIfExists, getFilePath } from "../config/file-storage.js";
import { Op } from "sequelize";

export async function queryTopics(req, res) {
  let query = {
    attributes: ["id", "professorId", "title", "summary"],
    limit: req.query.limit,
    offset: req.query.offset,
    order: [["id", "ASC"]],
    where: {
      ...(req.query.professorId && { professorId: req.query.professorId }),
    },
  };

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
  const topic = await Topic.findByPk(req.params.id, {
    attributes: { exclude: ["descriptionFile"] },
  });

  if (!topic) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }

  res.status(StatusCodes.OK).json(topic);
}

export async function patchTopic(req, res) {
  const topic = await Topic.findByPk(req.params.id);

  if (!topic) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }

  await topic.update(req.body);

  res.status(StatusCodes.CREATED).json(topic);
}

export async function uploadTopicDescription(req, res) {
  const topic = await Topic.findByPk(req.params.id);

  if (!topic) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }

  if (!req.file) {
    return res.status(StatusCodes.BAD_REQUEST).send();
  }

  deleteIfExists(topic.descriptionFile);
  topic.descriptionFile = req.file.filename;
  await topic.save();

  res.status(StatusCodes.CREATED).send();
}

export async function getTopicDescription(req, res) {
  const topic = await Topic.findByPk(req.params.id);

  if (!topic || !topic.descriptionFile) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }

  res.sendFile(getFilePath(topic.descriptionFile));
}
