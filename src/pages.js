import express from "express";
import expressEjsLayouts from "express-ejs-layouts";

import cookieParser from "cookie-parser";
import path from "path";
import { setPage } from "./middleware/pages.js";
import Joi from "joi";
import { expressJoiValidations } from "express-joi-validations";
import { validate } from "./middleware/validation.js";
import { ThesisRole, ThesisStatus, UserRole } from "./constants.js";
import ThesisService from "./services/thesis.service.js";
import { requirePageAuth } from "./middleware/pages.js";
import AuthService from "./services/auth.service.js";
import { extractTokenFromRequest } from "./util.js";
import process from "process";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const pages = express();

// EJS templates
pages.set("view engine", "ejs");
pages.set("views", path.join(__dirname, "views"));

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
  }
}

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
    maxAge: 5 * 60 * 60 * 1000, // 5 hours (5 * 3600 seconds)
  });

  res.redirect("/");
});

pages.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

pages.get("/login", async (req, res) => {
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

pages.get(
  "/praktiko",
  requirePageAuth,
  expressJoiValidations({ throwErrors: true }),
  validate({
    query: Joi.object({
      thesisId: Joi.number().integer().min(1).required(),
    }),
  }),
  async (req, res) => {
    const data = await ThesisService.getExtra(req.query.thesisId, req.user);

    // Not allowed to view if no grade
    if (data.grade !== null) {
      return res.redirect("/");
    }

    // TODO: when is this allowed?
    // presentation must exist

    data.committeeMembers.map((member) => {
      if (member.role == ThesisRole.SUPERVISOR) {
        member.role = "Επιβλέπων";
      } else {
        member.role = "Μέλος";
      }
    });

    const presentation = await ThesisService.getPresentation(
      req.query.thesisId,
      req.user
    );


    res.render("pages/praktiko", {
      studentName: data.student,
      hall: presentation.hall,
      date: presentation.date.toLocaleDateString("el-GR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      day: presentation.date.toLocaleDateString("el-GR", {
        weekday: "long",
      }),
      time: presentation.date.toLocaleTimeString("el-GR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      committee: data.committeeMembers,
      assemblyNumber: data.assemblyNumber,
      thesisTitle: data.topic,
      supervisorName: data.supervisor,
      grade: data.grade,
      votes: ["ΝΑΙ", "ΝΑΙ", "ΝΑΙ"],
      layout: "layout",
      title: "Πρακτικό Εξέτασης",
    });
  }
);

// Redirect to role-based home
pages.get("/", requirePageAuth, async (req, res) => {
  return res.redirect(getHomeRedirectPath(req.user.role));
});

pages.get("/secretary/:page", requirePageAuth, async (req, res) => {
  if (req.user.role !== UserRole.SECRETARY) {
    return res.redirect("/");
  }

  const secretaryLinks = [
    {
      href: "/secretary/home",
      icon: "bi-house",
      title: "Αρχική",
    },
    {
      href: "/secretary/theses",
      icon: "bi-journal-text",
      title: "Διπλωματικές",
    },
    {
      href: "/secretary/data-entry",
      icon: "bi-pencil-square",
      title: "Καταχώρηση Δεδομένων",
    },
  ];

  return res.render(`pages/secretary/${req.params.page}`, {
    title: secretaryLinks.find((link) => link.href === req.path)?.title,
    user: req.user,
    links: secretaryLinks,
    layout: "layouts/basic",
  });
});

pages.get("/student/:page", requirePageAuth, async (req, res) => {
  if (req.user.role !== UserRole.STUDENT) {
    return res.redirect("/");
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
    links: studentLinks,
    layout: "layouts/basic",
  });
});

pages.get("/professor/:page", requirePageAuth, async (req, res) => {
  if (req.user.role !== UserRole.PROFESSOR) {
    return res.redirect("/");
  }

  const professorLinks = [
    {
      href: "/professor/topics-manage",
      icon: "bi-house-door",
      title: "Αρχική",
    },
    {
      href: "/professor/assignments",
      icon: "bi-journal-plus",
      title: "Θέματα & Ανάθεση",
    },
    {
      href: "/professor/theses-list",
      icon: "bi-collection",
      title: "Οι Διπλωματικές μου",
    },
    {
      href: "/professor/invitations",
      icon: "bi-envelope",
      title: "Προσκλήσεις",
    },
    {
      href: "/professor/statistics",
      icon: "bi-graph-up",
      title: "Στατιστικά",
    },
  ];

  return res.render(`pages/professor/${req.params.page}`, {
    title: professorLinks.find((link) => link.href === req.path)?.title,
    links: professorLinks,
    layout: "layouts/basic",
  });
});

export default pages;
