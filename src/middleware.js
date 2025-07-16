import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";

dotenv.config();

export async function auth(req, res, next) {
  const authHeader = req.headers["authorization"]; // The header is "Authorization: Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token received:", token);
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).send();
  }

  // TODO
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    console.log("Authenticated user with ID:", req.userId);
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  next();
}

export async function errorHandler(err, req, res, next) {
  if (err.isJoi) {
    // Handle Joi validation errors
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: err.details[0].message,
    });
  }

  console.error(err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
  });
}
