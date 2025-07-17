import { StatusCodes } from "http-status-codes";
import { ThesisTopic } from "../models.js";

export async function queryThesisTopics(req, res) {
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

  const thesisTopics = ThesisTopic.findAll(query);

  res.status(StatusCodes.OK).json(thesisTopics);
}
