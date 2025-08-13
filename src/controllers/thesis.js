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

// TODO: implement
export async function getThesis(req, res) {}

export async function patchThesis(req, res) {}

export async function inviteProfessorToThesis(req, res) {}
