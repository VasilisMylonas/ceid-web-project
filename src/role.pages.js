import express from "express";
import Joi from "joi";
import expressJoiValidations, { validate } from "express-joi-validation";
import { UserRole } from "./constants.js";
import ThesisService from "./services/thesis.service.js";
import { requirePageAuth } from "./middleware/pages.js";

const rolePages = express.Router();
rolePages.use(requirePageAuth);

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

rolePages.get(
  "/praktiko",
  expressJoiValidations({ throwErrors: true }),
  validate({
    query: Joi.object({
      thesisId: Joi.number().integer().min(1).required(),
    }),
  }),
  async (req, res) => {
    const data = await ThesisService.getExtra(req.query.thesisId, req.user);

    console.log(data);

    res.render("pages/praktiko", {
      studentName: "Γιάννης Παπαδόπουλος",
      hall: "Αίθουσα 1",
      date: "2025-09-18",
      day: "Πέμπτη",
      time: "12:00",
      committee: [
        { name: "Καθηγητής Α", role: "Επιβλέπων" },
        { name: "Καθηγητής Β", role: "Μέλος" },
        { name: "Καθηγητής Γ", role: "Μέλος" },
      ],
      assemblyNumber: "123",
      thesisTitle: "Ανάπτυξη Εφαρμογής Web",
      supervisorName: "Καθηγητής Α",
      votes: ["ΝΑΙ", "ΝΑΙ", "ΝΑΙ"],
      grade: "9.5",
      layout: "layout",
      title: "Πρακτικό Εξέτασης",
    });
  }
);

// Redirect to role-based home
rolePages.get("/", async (req, res) => {
  return res.redirect(getHomeRedirectPath(req.user.role));
});

rolePages.get("/secretary/:page", async (req, res) => {
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
    links: secretaryLinks,
    layout: "layouts/basic",
  });
});

rolePages.get("/student/:page", async (req, res) => {
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

export default rolePages;
