import express from "express";
import { expressJoiValidations } from "express-joi-validations";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import thesisRoutes from "./routes/thesis.routes.js";
import noteRoutes from "./routes/note.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import presentationRoutes from "./routes/presentation.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import studentRoutes from "./routes/student.routes.js";
import myRoutes from "./routes/my.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";

const api = express.Router();
api.use(express.json()); // JSON middleware
api.use(cookieParser()); // Parse cookies, for cookie-based login
api.use(expressJoiValidations({ throwErrors: true })); // Request validation
api.use("/v1/auth", authRoutes);
api.use("/v1/topics", topicRoutes);
api.use("/v1/users", userRoutes);
api.use("/v1/theses", thesisRoutes);
api.use("/v1/invitations", invitationRoutes);
api.use("/v1/my", myRoutes);
api.use("/v1/students", studentRoutes);

// TODO
// app.use("/v1/notes", noteRoutes);
// app.use("/v1/resources", resourceRoutes);
// app.use("/v1/presentations", presentationRoutes);

api.use(errorHandler); // Use error handler middleware, after all routes

export default api;
