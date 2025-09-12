import express from "express";

import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import topicRoutes from "./topic.routes.js";
import thesisRoutes from "./thesis.routes.js";
import noteRoutes from "./note.routes.js";
import resourceRoutes from "./resource.routes.js";
import presentationRoutes from "./presentation.routes.js";
import invitationRoutes from "./invitation.routes.js";
import myRoutes from "./my.routes.js";

import { errorHandler } from "../middleware/errorHandler.js";
import { expressJoiValidations } from "express-joi-validations";
import cookieParser from "cookie-parser";
import { wrapResponse } from "../middleware/responses.js";

const router = express.Router();
router.use(express.json()); // JSON middleware
router.use(cookieParser()); // Parse cookies, for cookie-based login
router.use(wrapResponse()); // Wrap all responses in a standard format
router.use(expressJoiValidations({ throwErrors: true })); // Request validation
router.use("/auth", authRoutes);
router.use("/topics", topicRoutes);
router.use("/users", userRoutes);
router.use("/theses", thesisRoutes);
router.use("/invitations", invitationRoutes);
router.use("/my", myRoutes);
router.use("/notes", noteRoutes);
router.use("/resources", resourceRoutes);
router.use("/presentations", presentationRoutes);

router.use(errorHandler); // Use error handler middleware, after all routes

export default router;
