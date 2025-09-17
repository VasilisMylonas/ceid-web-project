import express from "express";

import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import topicRoutes from "./topic.routes.js";
import thesisRoutes from "./thesis.routes.js";
import noteRoutes from "./note.routes.js";
import resourceRoutes from "./resource.routes.js";
import presentationRoutes from "./presentation.routes.js";
import invitationRoutes from "./invitation.routes.js";
import studentRoutes from "./student.routes.js";
import myRoutes from "./my.routes.js";

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/topics", topicRoutes);
router.use("/users", userRoutes);
router.use("/theses", thesisRoutes);
router.use("/invitations", invitationRoutes);
router.use("/my", myRoutes);
router.use("/notes", noteRoutes);
router.use("/resources", resourceRoutes);
router.use("/students", studentRoutes);
router.use("/presentations", presentationRoutes);

export default router;
