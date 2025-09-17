import { NotFoundError, SecurityError, ConflictError } from "../errors.js";
import { StatusCodes } from "http-status-codes";
import { UniqueConstraintError } from "sequelize";

export async function errorHandler(err, req, res, next) {
  if (err.isJoi) {
    // Handle Joi validation errors
    return res.error(err.message, StatusCodes.UNPROCESSABLE_ENTITY);
  }

  if (err instanceof UniqueConstraintError) {
    return res.error(err.errors[0].message, StatusCodes.CONFLICT);
  }

  if (err instanceof SyntaxError) {
    return res.error(err.message, StatusCodes.BAD_REQUEST);
  }

  if (err instanceof NotFoundError) {
    return res.error(err.message, StatusCodes.NOT_FOUND);
  }

  if (err instanceof SecurityError) {
    return res.error(err.message, StatusCodes.FORBIDDEN);
  }

  if (err instanceof ConflictError) {
    return res.error(err.message, StatusCodes.CONFLICT);
  }

  console.error(err);

  return res.error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
}
