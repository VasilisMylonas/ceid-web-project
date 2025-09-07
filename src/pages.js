import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import AuthService from "./services/auth.service.js";
import { UserRole } from "./constants.js";
import { extractTokenFromRequest } from "./util.js";
import cookieParser from "cookie-parser";

const pages = express.Router();

pages.use(expressEjsLayouts); // EJS layouts
pages.use(express.urlencoded({ extended: true })); // Parse form data
pages.use(cookieParser()); // Parse cookies

function getHomeRedirectPath(role) {
  switch (role) {
    case UserRole.PROFESSOR:
      return "/professor";
    case UserRole.STUDENT:
      return "/student";
    case UserRole.SECRETARY:
      return "/secretary";
    default:
      return "/login";
  }
}

pages.get("/login", async (req, res) => {
  const token = extractTokenFromRequest(req);
  const user = await AuthService.verifyToken(token);

  // User already logged in
  if (user) {
    return res.redirect(getHomeRedirectPath(user.role));
  }

  res.render("pages/login", { title: "Σύνδεση", error: null });
});

pages.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const token = await AuthService.login(username, password);

  if (!token) {
    return res.render("pages/login", {
      title: "Σύνδεση",
      error: "Σφάλμα σύνδεσης. Δοκιμάστε ξανά.",
    });
  }

  // Set HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour (3600 seconds)
  });

  const user = await AuthService.verifyToken(token);
  res.redirect(getHomeRedirectPath(user.role));
});

pages.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

export default pages;
