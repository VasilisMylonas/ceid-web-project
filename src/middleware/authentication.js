import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export async function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"]; // The header is "Authorization: Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token received:", token);
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).send();
  }

  // TODO: improve authentication
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    req.userRole = jwt.verify(token, process.env.JWT_SECRET).role;
    if (!req.userId || !req.userRole) {
      return res.status(StatusCodes.UNAUTHORIZED).send();
    }
    console.log(`Authenticated user ${req.userId} (${req.userRole})`);
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  next();
}

export function requireRole(role) {
  return async (req, res, next) => {
    if (req.userRole !== role) {
      return res.status(StatusCodes.FORBIDDEN).send();
    }
    next();
  };
}
