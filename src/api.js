import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";
import { expressJoiValidations } from "express-joi-validations";
import { wrapResponse } from "./middleware/responses.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import thesisRoutes from "./routes/thesis.routes.js";
import noteRoutes from "./routes/note.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import studentRoutes from "./routes/student.routes.js";
import myRoutes from "./routes/my.routes.js";
import announcementRoutes from "./routes/announcements.routes.js";

const api = express();

api.use(wrapResponse()); // Wrap all responses in a standard format
api.use(express.json()); // JSON middleware
api.use(cookieParser()); // Parse cookies, for cookie-based login
api.use(expressJoiValidations({ throwErrors: true })); // Request validation
api.use("/v1/auth", authRoutes);
api.use("/v1/topics", topicRoutes);
api.use("/v1/users", userRoutes);
api.use("/v1/theses", thesisRoutes);
api.use("/v1/invitations", invitationRoutes);
api.use("/v1/my", myRoutes);
api.use("/v1/notes", noteRoutes);
api.use("/v1/resources", resourceRoutes);
api.use("/v1/students", studentRoutes);
api.use("/v1/announcements", announcementRoutes);
api.use(errorHandler); // Use error handler middleware

export default api;
