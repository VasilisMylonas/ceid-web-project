import { StatusCodes } from "http-status-codes";
import { Thesis } from "../models/index.js";
import { Op } from "sequelize";
import { getFilePath } from "../config/file-storage.js";

export async function queryTheses(req, res) {
  let query = {
    // attributes: ["id", "title", "summary"],
    limit: req.query.limit,
    offset: req.query.offset,
    order: [["id", "ASC"]],
    where: {},
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

  const theses = await Thesis.findAll(query);
  res.status(StatusCodes.OK).json(theses);
}

export async function getThesis(req, res) {
  const thesis = await Thesis.findByPk(req.params.id, {
    attributes: { exclude: ["documentFile"] }, // Exclude documentFile for security
  });
  if (!thesis) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  res.status(StatusCodes.OK).json(thesis);
}

export async function patchThesis(req, res) {
  await req.thesis.update(req.body);
  res.status(StatusCodes.OK).json(req.thesis);
}

export async function deleteThesis(req, res) {
  await req.thesis.destroy();
  res.status(StatusCodes.NO_CONTENT).send();
}

// TODO: implement
export async function putThesisDocument(req, res) {}

export async function getThesisDocument(req, res) {
  if (!req.thesis.documentFile) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  res.sendFile(getFilePath(req.thesis.documentFile));
}
