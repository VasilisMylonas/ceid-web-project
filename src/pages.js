import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import AuthService from "./services/auth.service.js";
import { UserRole } from "./constants.js";
import { extractTokenFromRequest } from "./util.js";
import cookieParser from "cookie-parser";
import process from "process";

const pages = express.Router();

// Middleware to set ejs `page` variable
function setPage() {
  return (req, res, next) => {
    res.locals.page = req.path;
    next();
  };
}

pages.use(expressEjsLayouts); // EJS layouts
pages.use(express.urlencoded({ extended: true })); // Parse form data
pages.use(cookieParser()); // Parse cookies
pages.use(setPage());

function getHomeRedirectPath(role) {
  switch (role) {
    case UserRole.PROFESSOR:
      return "/professor/home";
    case UserRole.STUDENT:
      return "/student/home";
    case UserRole.SECRETARY:
      return "/secretary/home";
    default:
      return "/login";
  }
}

pages.get("/login", async (req, res) => {
  const token = extractTokenFromRequest(req);
  const user = await AuthService.verifyToken(token);

  // User already logged in
  if (user) {
    return res.redirect("/");
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

  res.redirect("/");
});

pages.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

pages.get("/", async (req, res) => {
  const token = extractTokenFromRequest(req);
  const user = await AuthService.verifyToken(token);

  if (!user) {
    return res.redirect("/login");
  }

  return res.redirect(getHomeRedirectPath(user.role));
});

pages.get("/student/:page", async (req, res) => {
  const token = extractTokenFromRequest(req);
  const user = await AuthService.verifyToken(token);

  if (!user) {
    return res.redirect("/login");
  }

  if (user.role !== UserRole.STUDENT) {
    return res.redirect(getHomeRedirectPath(user.role));
  }

  const studentLinks = [
    {
      href: "/student/home",
      icon: "bi-house",
      title: "Αρχική",
    },
    {
      href: "/student/view-topic",
      icon: "bi-book",
      title: "Προβολή θέματος",
    },
    {
      href: "/student/manage-thesis",
      icon: "bi-file-earmark-check",
      title: "Διαχείριση Διπλωματικής Εργασίας",
    },
    {
      href: "/student/edit-profile",
      icon: "bi-person-circle",
      title: "Επεξεργασία Προφίλ",
    },
  ];

  return res.render(`pages/student/${req.params.page}`, {
    title: studentLinks.find((link) => link.href === req.path)?.title,
    layout: "layouts/student",
    links: studentLinks,
  });
});

export default pages;
