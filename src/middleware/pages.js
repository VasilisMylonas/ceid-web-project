import AuthService from "../services/auth.service.js";
import { extractTokenFromRequest } from "../util.js";

// Middleware to set ejs `page` variable
export function setPage() {
  return (req, res, next) => {
    res.locals.page = req.path;
    next();
  };
}

// Middleware to check authentication
export async function requirePageAuth(req, res, next) {
  const token = extractTokenFromRequest(req);
  const user = await AuthService.verifyToken(token);

  if (!user) {
    return res.redirect("/login");
  }

  req.user = user;
  next();
}
