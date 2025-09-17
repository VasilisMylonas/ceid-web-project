import { StatusCodes } from "http-status-codes";

export function model(Model, field) {
  return async (req, res, next) => {
    let model = await Model.findByPk(req.params.id);
    if (!model) {
      return res.status(StatusCodes.NOT_FOUND).json();
    }

    req[field] = model;

    next();
  };
}
