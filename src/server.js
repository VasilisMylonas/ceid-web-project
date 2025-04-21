import express from "express";
import dotenv from "dotenv";
import { sequelize } from "./config/db.js";
import topicRoutes from "./routes/topicRoutes.js";
import authRoutes from "./routes/authRoutes.js";

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
      title: fakerEL.lorem.sentence(),
      summary: fakerEL.lorem.paragraph(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await Topic.bulkCreate(dummyTopics);
}

await setupDatabase();

export const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

/*

2) Topic assignment to student
POST /api/topics/:id/assign (assign topic to student)
POST /api/topics/:id/unassign (unassign topic from student)
POST /api/topics/:id/finalize (finalize topic)

3) Theses management
GET /api/theses (view all thesis)
GET /api/theses/:id  (view thesis)
POST /api/theses (create thesis)
PUT /api/theses/:id (update thesis)
POST /api/theses/:id/notes (add notes)
GET /api/theses/:id/notes (view notes)
POST /api/theses/:id/submit (submit thesis)
POST /api/theses/:id/cancel (cancel thesis)
POST /api/theses/:id/approve (approve thesis)
POST /api/theses/:id/reject (reject thesis)

4)
GET /api/invitations (view all invitations)
POST /api/invitations/:id/accept (accept invitation)
POST /api/invitations/:id/reject (reject invitation)

5)
GET /api/statistics (view statistics)

*/
