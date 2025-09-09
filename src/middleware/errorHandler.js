import { StatusCodes } from "http-status-codes";
import { UniqueConstraintError } from "sequelize";

export async function errorHandler(err, req, res, next) {
  if (err.isJoi) {
    // Handle Joi validation errors
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: err.message,
    });
  }

  if (err instanceof UniqueConstraintError) {
    console.log(err);
    return res.status(StatusCodes.CONFLICT).json({
      message: err.errors[0].message,
    });
  }

  console.error(err);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
  });
}
