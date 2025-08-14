import { StatusCodes } from "http-status-codes";
import { Thesis } from "../models/index.js";
import { Op } from "sequelize";

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
  try {
    const thesis = await Thesis.findByPk(req.params.id);
    if (!thesis) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Thesis not found" });
    }
    res.status(StatusCodes.OK).json(thesis);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
}

export async function patchThesis(req, res) {
  try {
    const thesis = await Thesis.findByPk(req.params.id);
    if (!thesis) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Thesis not found" });
    }
    await thesis.update(req.body);
    res.status(StatusCodes.OK).json(thesis);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
}

export async function inviteProfessorToThesis(req, res) {
  // Example: Add logic to invite a professor to a thesis
  // This will depend on your data model (e.g., linking professor to thesis)
  res.status(StatusCodes.NOT_IMPLEMENTED).json({ error: "Not implemented" });
}

export async function deleteThesis(req, res) {
  try {
    const thesis = await Thesis.findByPk(req.params.id);
    if (!thesis) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Thesis not found" });
    }
    await thesis.destroy();
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
}
