import { StatusCodes } from "http-status-codes";

async function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(StatusCodes.BAD_REQUEST).json({
    status: "error",
    message: "Internal Server Error",
  });
}

export default errorHandler;
