import express from "express";
import dotenv from "dotenv";

dotenv.config();

import { sequelize } from "./config/db.js";
import topicRoutes from "./routes/topicRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import User from "./models/User.js";

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
    await sequelize.sync({ force: true }); // Remove force in production
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing database:", error);
    process.exit(1);
  }

  try {
    await User.create({
      username: "up0000000",
      password: "password",
      email: "up0000000@ac.upatras.gr",
      role: "student",
    });
    await User.create({
      username: "admin",
      password: "admin",
      email: "webmaster@upatras.gr",
      role: "admin",
    });
    console.log("Test users created successfully");
  } catch (error) {
    console.error("Error creating test user:", error);
    process.exit(1);
  }
}

export const app = express();

setupDatabase();

app.use(express.json());
app.use("/api/auth", authRoutes); // Authentication
app.use("/api/topics", topicRoutes); // Topic management

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

/*

1) Topic Management
GET /api/topics (view all topics)
POST /api/topics (create topic)
GET /api/topics/:id (view topic)
PUT /api/topics/:id (update topic)
DELETE /api/topics/:id (delete topic)

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
