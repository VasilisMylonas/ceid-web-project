import express from "express";
import morgan from "morgan";
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

const app = express();
app.use(express.json()); // JSON middleware
app.use(morgan("dev")); // Logging middleware
app.use(expressJoiValidations({ throwErrors: true })); // Request validation
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/theses", thesisRoutes);
app.use("/api/v1/invitations", invitationRoutes);
app.use("/api/v1/my", myRoutes);

// app.use("/api/v1/notes", noteRoutes);
// app.use("/api/v1/resources", resourceRoutes);

// app.use("/api/v1/presentations", presentationRoutes);
// app.use("/api/v1/students", studentRoutes);
app.use(errorHandler); // Use error handler middleware, after all routes

export default app;
