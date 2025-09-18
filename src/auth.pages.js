import express from "express";
import AuthService from "./services/auth.service.js";
import { extractTokenFromRequest } from "./util.js";
import process from "process";

const authPages = express.Router();

authPages.post("/login", async (req, res) => {
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

  res.redirect("/");
});

authPages.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

authPages.get("/login", async (req, res) => {
  const token = extractTokenFromRequest(req);
  const user = await AuthService.verifyToken(token);

  // User already logged in
  if (user) {
    return res.redirect("/");
  }

  res.render("pages/login", {
    title: "Σύνδεση",
    error: null,
  });
});

export default authPages;
