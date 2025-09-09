import { StatusCodes } from "http-status-codes";

export async function errorHandler(err, req, res, next) {
  if (err.isJoi) {
    // Handle Joi validation errors
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: err.message,
    });
  }

  console.error(err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
  });
}
