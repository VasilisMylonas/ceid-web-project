import express from "express";
import dotenv from "dotenv";
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
import { sequelize } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { seedData } from "./seeders.js";

dotenv.config(); // Load .env

export const app = express();
app.use(express.json()); // JSON middleware
app.use(morgan("dev")); // Logging middleware
app.use(expressJoiValidations({ throwErrors: true })); // Request validation
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/theses", thesisRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/presentations", presentationRoutes);
app.use("/api/v1/invitations", invitationRoutes);
app.use(errorHandler); // Use error handler middleware, after all routes

try {
  await sequelize.authenticate();
  console.log("Database connected successfully");
  // await sequelize.sync({ force: true }); // TODO: Remove in final version
  // console.log("Database synchronized successfully");
  // await seedData();
  // console.log("Data seeded successfully");
} catch (error) {
  console.error("Database error:", error);
  process.exit(1);
}

// Start server
export const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
