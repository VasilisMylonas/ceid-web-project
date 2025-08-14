import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { expressJoiValidations } from "express-joi-validations";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import thesisRoutes from "./routes/thesis.routes.js";
import { sequelize } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { seedData } from "./seeders.js";

dotenv.config(); // Load .env

export const app = express();
app.use(express.json()); // JSON middleware
app.use(morgan("dev")); // Logging middleware
app.use(expressJoiValidations({ throwErrors: true })); // Request validation
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/theses", thesisRoutes);
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
