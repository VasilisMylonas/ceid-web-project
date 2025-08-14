import { faker } from "@faker-js/faker";
import {
  Professor,
  Student,
  Secretary,
  Topic,
  User,
  Thesis,
} from "./models/index.js";
import bcrypt from "bcrypt";

function getRandomDivision() {
  const divisions = [
    "Software Engineering",
    "Telecommunication Engineering",
    "Hardware Engineering",
    "Algorithms and Data Structures",
    "Information Engineering",
  ];
  return divisions[Math.floor(Math.random() * divisions.length)];
}

function getRandomStatus() {
  const statuses = [
    "pending",
    "approved",
    "rejected",
    "completed",
    "cancelled",
    "under_examination",
  ];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

export async function seedProfessors(count) {
  for (let i = 0; i < count; i++) {
    const user = await User.create({
      username: faker.internet.username(),
      password: await bcrypt.hash("password", 10),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: "professor",
    });

    await Professor.create({
      id: user.id,
      division: getRandomDivision(),
    });
  }
}

export async function seedStudents(count) {
  for (let i = 0; i < count; i++) {
    const user = await User.create({
      username: faker.internet.username(),
      password: await bcrypt.hash("password", 10),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: "student",
    });

    await Student.create({
      id: user.id,
    });
  }
}

export async function seedSecretaries(count) {
  for (let i = 0; i < count; i++) {
    const user = await User.create({
      username: faker.internet.username(),
      password: await bcrypt.hash("password", 10),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: "secretary",
    });

    await Secretary.create({
      id: user.id,
    });
  }
}

export async function seedTopics(count) {
  const professors = await Professor.findAll();
  for (let i = 0; i < count; i++) {
    await Topic.create({
      professorId: professors[Math.floor(Math.random() * professors.length)].id,
      title: faker.lorem.sentence(),
      summary: faker.lorem.paragraph(),
    });
  }
}

export async function seedTheses(count) {
  const students = await Student.findAll();
  const topics = await Topic.findAll();
  for (let i = 0; i < count; i++) {
    const protocolNumber = `PN-${faker.string.numeric(6)}`;
    const status = getRandomStatus();

    let endDate = faker.date.future();
    let statusReason = null;
    if (status === "rejected") {
      statusReason = "APO GRAMMATEIA";
      endDate = faker.date.past();
    }

    if (status === "cancelled") {
      statusReason = "Cancelled by student";
      faker.date.past();
    }

    if (status == "pending") {
      endDate = null;
    }

    await Thesis.create({
      title: faker.lorem.sentence(),
      summary: faker.lorem.paragraph(),
      studentId: students[Math.floor(Math.random() * students.length)].id,
      topicId: topics[Math.floor(Math.random() * topics.length)].id,
      status: status,
      statusReason: statusReason,
      protocolNumber: protocolNumber,
      startDate: faker.date.past(),
      endDate: endDate,
    });
  }
}

export async function seedData() {
  const adminUser = await User.create({
    username: "admin",
    password: await bcrypt.hash("admin", 10),
    email: "example@email.com",
    name: "Vasilis Mylonas",
    role: "professor",
  });

  await Professor.create({
    id: adminUser.id,
    division: "Hardware Engineering",
  });

  await Promise.all([
    seedProfessors(30),
    seedStudents(300),
    seedSecretaries(5),
  ]);

  await seedTopics(50);
  await seedTheses(50);
}
