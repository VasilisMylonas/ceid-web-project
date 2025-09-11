import { StatusCodes } from "http-status-codes";
import { UniqueConstraintError } from "sequelize";

export async function errorHandler(err, req, res, next) {
  if (err.isJoi) {
    // Handle Joi validation errors
    return res.error(err.message, StatusCodes.BAD_REQUEST);
  }

  if (err instanceof UniqueConstraintError) {
    return res.error(err.errors[0].message, StatusCodes.CONFLICT);
  }

  console.error(err);

  res.error("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
}
