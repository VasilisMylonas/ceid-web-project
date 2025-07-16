import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { expressJoiValidations } from "express-joi-validations";

import routes from "./routes.js";
import { sequelize } from "./config/database.js";
import { Professor, User } from "./models.js";
import { errorHandler } from "./middleware.js";

dotenv.config(); // Load .env

export const app = express();
app.use(express.json()); // Use json middleware
app.use(expressJoiValidations({ throwErrors: true }));
app.use("/api", routes); // Use API routes
app.use(errorHandler); // Use error handler middleware, after all routes

try {
  await sequelize.authenticate();
  console.log("Database connected successfully");
  await sequelize.sync({ force: true }); // TODO: Remove force in final version
  console.log("Database synchronized successfully");
  await createInitialData();
  console.log("Initial data created successfully");
} catch (error) {
  console.error("Database error:", error);
  process.exit(1);
}

// Start server
export const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

async function createInitialData() {
  await User.create({
    username: "admin",
    password: await bcrypt.hash("admin", 10),
    email: "admin@example.com",
    name: "Vasilis Mylonas",
    role: "professor",
  });

  await Professor.create({
    id: await User.findOne({ where: { username: "admin" } }).then(
      (user) => user.id
    ),
    division: "Computer Science",
  });
}

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
