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
  const professors = [];
  for (let i = 0; i < count; i++) {
    const user = await User.create({
      username: faker.internet.username(),
      password: await bcrypt.hash("password", 10),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: "professor",
    });

    const professor = await Professor.create({
      id: user.id,
      division: getRandomDivision(),
    });

    professors.push(professor);
  }
  return professors;
}

export async function seedStudents(count) {
  const students = [];
  for (let i = 0; i < count; i++) {
    const user = await User.create({
      username: faker.internet.username(),
      password: await bcrypt.hash("password", 10),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: "student",
    });

    const student = await Student.create({
      id: user.id,
    });

    students.push(student);
  }
  return students;
}

export async function seedSecretaries(count) {
  const secretaries = [];
  for (let i = 0; i < count; i++) {
    const user = await User.create({
      username: faker.internet.username(),
      password: await bcrypt.hash("password", 10),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: "secretary",
    });

    const secretary = await Secretary.create({
      id: user.id,
    });

    secretaries.push(secretary);
  }
  return secretaries;
}

export async function seedTopics(count) {
  const professors = await Professor.findAll();
  const thesisTopics = [];
  for (let i = 0; i < count; i++) {
    const topic = await Topic.create({
      professorId: professors[Math.floor(Math.random() * professors.length)].id,
      title: faker.lorem.sentence(),
      summary: faker.lorem.paragraph(),
    });
    thesisTopics.push(topic);
  }
  return thesisTopics;
}

// TODO: seeder
export async function seedTheses(count) {
  const theses = [];
  const students = await Student.findAll();
  const topics = await Topic.findAll();
  for (let i = 0; i < count; i++) {
    const protocolNumber = `PN-${faker.string.numeric(6)}`;
    const status = getRandomStatus();

    // if (status === "cancelled") {

    const thesis = await Thesis.create({
      title: faker.lorem.sentence(),
      summary: faker.lorem.paragraph(),
      studentId: students[Math.floor(Math.random() * students.length)].id,
      topicId: topics[Math.floor(Math.random() * topics.length)].id,
      status: status,
      startDate: faker.date.past(),
      endDate: status === "under_examination" ? faker.date.future() : null,
    });
    theses.push(thesis);
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
