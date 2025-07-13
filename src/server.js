import express from "express";
import dotenv from "dotenv";
import { sequelize } from "./config/db.js";
import topicRoutes from "./routes/topicRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

import User from "./models/User.js";
import Topic from "./models/Topic.js";
import bcrypt from "bcrypt";
import { faker, fakerEL } from "@faker-js/faker";

dotenv.config();

export const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes); // Authentication
app.use("/api/topics", topicRoutes); // Topic management

async function setupDatabase() {
  // Test database connection
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }

  // Sync models
  try {
    await sequelize.sync({ force: true }); // TODO: Remove force in production
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing database:", error);
    process.exit(1);
  }

  // Create dummy admin user
  await User.create({
    username: "admin",
    password: await bcrypt.hash("admin", 10),
    role: "admin",
    email: "admin@example.com",
  });

  const dummyUsers = [];

  for (let i = 0; i < 10; i++) {
    dummyUsers.push({
      username: faker.internet.username(),
      password: await bcrypt.hash("password", 10),
      role: faker.helpers.arrayElement(["student", "professor"]),
      email: faker.internet.email(),
      name: fakerEL.person.fullName(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await User.bulkCreate(dummyUsers);

  const dummyTopics = [];

  for (let i = 0; i < 20; i++) {
    dummyTopics.push({
      userId: faker.number.int({ min: 2, max: 11 }),
      title: faker.lorem.sentence(),
      summary: faker.lorem.paragraph(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await Topic.bulkCreate(dummyTopics);
}

// Swagger setup, this is for API documentation and testing
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(YAML.load("./swagger.yaml"))
);

await setupDatabase();

export const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
