import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { expressJoiValidations } from "express-joi-validations";

import routes from "./routes/index.js";
import { sequelize } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { seedData } from "./seeders.js";

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

// import { faker, fakerEL } from "@faker-js/faker";
// const dummyUsers = [];
// for (let i = 0; i < 10; i++) {
//   dummyUsers.push({
//     username: faker.internet.username(),
//     password: await bcrypt.hash("password", 10),
//     role: faker.helpers.arrayElement(["student", "professor"]),
//     email: faker.internet.email(),
//     name: fakerEL.person.fullName(),
//   });
// }
// await User.bulkCreate(dummyUsers);
// const dummyTopics = [];
// for (let i = 0; i < 20; i++) {
//   dummyTopics.push({
//     professorId: faker.number.int({ min: 2, max: 11 }),
//     title: faker.lorem.sentence(),
//     summary: faker.lorem.paragraph(),
//   });
// }
// await Topic.bulkCreate(dummyTopics);
