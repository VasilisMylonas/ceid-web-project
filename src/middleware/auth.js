import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";

dotenv.config();

async function auth(req, res, next) {
  // TODO: remove authentication for testing
  req.auth = { id: 1 };

  // const authHeader = req.headers["authorization"]; // The header is "Authorization: Bearer <token>"
  // const token = authHeader && authHeader.split(" ")[1];
  // if (!token) {
  //   return res.status(StatusCodes.UNAUTHORIZED).send();
  // }
  // try {
  //   req.auth = jwt.verify(token, process.env.JWT_SECRET);
  next();
  // } catch (error) {
  //   console.error("Authentication error:", error);
  //   return res.status(StatusCodes.FORBIDDEN).send();
  // }
}

export default auth;
