import { StatusCodes } from "http-status-codes";
import { Topic, Thesis } from "../models/index.js";
import { deleteIfExists, getFilePath } from "../config/file-storage.js";
import { Op } from "sequelize";
import { ThesisStatus } from "../constants.js";

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

  // Filter by status

  if (req.query.status === "assigned") {
    query.include = [
      {
        model: Thesis,
        attributes: [],
      },
    ];

    query.where[Op.or] = [
      {
        "$Theses.status$": {
          [Op.in]: [
            ThesisStatus.UNDER_ASSIGNMENT,
            ThesisStatus.PENDING,
            ThesisStatus.APPROVED,
            ThesisStatus.COMPLETED,
            ThesisStatus.UNDER_EXAMINATION,
          ],
        },
      },
    ];
  }

  if (req.query.status === "unassigned") {
    query.include = [
      {
        model: Thesis,
        attributes: [],
      },
    ];

    query.where[Op.or] = [
      { "$Theses.id$": null },
      {
        "$Theses.status$": {
          [Op.in]: [ThesisStatus.REJECTED, ThesisStatus.CANCELLED],
        },
      },
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

export async function postTopic(req, res) {
  const { title, summary } = req.body;

  const thesisTopic = await Topic.create({
    title,
    summary,
    professorId: req.user.id,
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

export async function getTopicDescription(req, res) {
  const topic = await Topic.findByPk(req.params.id);
  if (!topic) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  if (!req.topic.descriptionFile) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  res.sendFile(getFilePath(req.topic.descriptionFile));
}

export async function patchTopic(req, res) {
  await req.topic.update(req.body);
  res.status(StatusCodes.OK).json(req.topic);
}

export async function deleteTopic(req, res) {
  // TODO: check if topic is linked to any theses
  await req.topic.destroy();
  res.status(StatusCodes.NO_CONTENT).send();
}

export async function putTopicDescription(req, res) {
  if (!req.file) {
    return res.status(StatusCodes.BAD_REQUEST).send();
  }

  deleteIfExists(req.topic.descriptionFile);
  req.topic.descriptionFile = req.file.filename;
  await req.topic.save();

  res.status(StatusCodes.CREATED).send();
}
