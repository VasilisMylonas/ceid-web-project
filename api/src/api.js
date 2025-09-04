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

const api = express();
api.use(express.json()); // JSON middleware
api.use(morgan("dev")); // Logging middleware
api.use(expressJoiValidations({ throwErrors: true })); // Request validation
api.use("/v1/auth", authRoutes);
api.use("/v1/topics", topicRoutes);
api.use("/v1/users", userRoutes);
api.use("/v1/theses", thesisRoutes);
api.use("/v1/invitations", invitationRoutes);
api.use("/v1/my", myRoutes);
api.use("/v1/students", studentRoutes);

import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import AdminJSSequelize from "@adminjs/sequelize";
import db from "./models/index.js";

AdminJS.registerAdapter(AdminJSSequelize);

const models = Object.values(db).filter((model) => model !== db.sequelize);

const adminJs = new AdminJS({
  resources: models.map((model) => {
    return {
      resource: model,
      options: {},
    };
  }),
  rootPath: "/admin",
});

const adminRouter = AdminJSExpress.buildRouter(adminJs);
api.use(adminJs.options.rootPath, adminRouter);

// TODO
// app.use("/v1/notes", noteRoutes);
// app.use("/v1/resources", resourceRoutes);
// app.use("/v1/presentations", presentationRoutes);

api.use(errorHandler); // Use error handler middleware, after all routes

export default api;
