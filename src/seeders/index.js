import db from "../models/index.js";
import { UserRole } from "../constants.js";
import seedProfessors from "./professors.js";
import seedStudents from "./students.js";
import seedSecretaries from "./secretaries.js";
import seedTopics from "./topics.js";
import seedTheses from "./theses.js";
import seedCommitteeMembers from "./committee-members.js";
import UserService from "../services/user.service.js";
import TopicService from "../services/topic.service.js";

export default async function seedDatabase() {
  await db.sequelize.sync({ force: true });

  // await Promise.all([
  //   seedProfessors(30),
  //   seedStudents(500),
  //   seedSecretaries(4),
  // ]);

  const professor = await UserService.create({
    username: "professor",
    password: "professor",
    email: "professor@example.com",
    name: "Test Professor",
    role: UserRole.PROFESSOR,
    phone: "6942023594",
    address: "ADDRESS",
    division: "Software Engineering",
  });

  await UserService.create({
    username: "student",
    password: "student",
    email: "student@example.com",
    name: "Test Student",
    role: UserRole.STUDENT,
    phone: "6942023594",
    address: "ADDRESS",
    am: "0",
  });

  await UserService.create({
    username: "secretary",
    password: "secretary",
    email: "secretary@example.com",
    name: "Test Secretary",
    role: UserRole.SECRETARY,
    phone: "6942023594",
    address: "ADDRESS",
  });

  TopicService.create({
    title: "Sample Topic 1",
    summary: "This is a sample topic for testing.",
    user: professor,
  });

  TopicService.create({
    title: "Sample Topic 2",
    summary: "This is a sample topic for testing.",
    user: professor,
  });

  TopicService.create({
    title: "Sample Topic 3",
    summary: "This is a sample topic for testing.",
    user: professor,
  });

  // await seedTopics(400);
  // await seedTheses(300);
  // await seedCommitteeMembers();
}
