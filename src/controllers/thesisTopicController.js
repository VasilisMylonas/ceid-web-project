import { StatusCodes } from "http-status-codes";
import { ThesisTopic } from "../models/index.js";

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

  const thesisTopics = await ThesisTopic.findAll(query);
  res.status(StatusCodes.OK).json(thesisTopics);
}

export async function postThesisTopic(req, res) {
  const { title, summary } = req.body;

  const thesisTopic = await ThesisTopic.create({
    title,
    summary,
    professorId: req.user.id, // Assuming the user is a professor
  });

  res.status(StatusCodes.CREATED).json(thesisTopic);
}
