import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { expressJoiValidations } from "express-joi-validations";

import routes from "./routes/index.js";
import { sequelize } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { seedData } from "./seeders.js";
import { User } from "./models/index.js";
import bcrypt from "bcrypt";

dotenv.config(); // Load .env

export const app = express();
app.use(express.json()); // Use json middleware
app.use(morgan("dev")); // Use morgan for logging
app.use(expressJoiValidations({ throwErrors: true })); // Use express-joi-validations for request validation
app.use("/api", routes); // Use API routes
app.use(errorHandler); // Use error handler middleware, after all routes

// TODO handle auth
app.use("/files", express.static("files"));

try {
  await sequelize.authenticate();
  console.log("Database connected successfully");
  await sequelize.sync({ force: true }); // TODO: Remove force in final version
  console.log("Database synchronized successfully");

  // TODO: Create admin user if it doesn't exist
  const adminExists = await User.findOne({ where: { username: "admin" } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin", 10);
    await User.create({
      username: "admin",
      password: hashedPassword,
      role: "admin",
      email: "admin@example.com",
      name: "Administrator"
    });
    console.log("Admin user created");
  } else {
    console.log("Admin user already exists");
  }

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
