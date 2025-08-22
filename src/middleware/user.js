import { StatusCodes } from "http-status-codes";

export async function requireSameUser(req, res, next) {
  if (req.user.id != req.params.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  next();
}
