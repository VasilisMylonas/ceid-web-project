import { StatusCodes } from "http-status-codes";

export function model(Model, field) {
  return async (req, res, next) => {
    req.model = await Model.findByPk(req.params.id);
    if (!req.model) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }

    if (field) {
      req[field] = req.model;
    }

    next();
  };
}
