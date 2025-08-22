import db from "../models/index.js";
import bcrypt from "bcrypt";
import { UserRole } from "../constants.js";
import seedProfessors from "./professors.js";
import seedStudents from "./students.js";
import seedSecretaries from "./secretaries.js";
import seedTopics from "./topics.js";
import seedTheses from "./theses.js";

await db.sequelize.sync({ force: true });
await Promise.all([seedProfessors(10), seedStudents(50), seedSecretaries(4)]);

const adminUser = await db.User.create({
  id: 1,
  username: "admin",
  password: await bcrypt.hash("admin", 10),
  email: "example@email.com",
  name: "Vasilis Mylonas",
  role: UserRole.PROFESSOR,
  phone: "6942023594",
});

await db.Professor.create({
  id: adminUser.id,
  division: "Hardware Engineering",
});

await seedTopics(60);
await seedTheses(40);
