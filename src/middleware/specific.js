import { StatusCodes } from "http-status-codes";

export async function manageUser(req, res, next) {
  if (req.user.id != req.params.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  // User already attached from authentication middleware
  next();
}
