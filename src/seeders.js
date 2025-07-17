import { faker } from "@faker-js/faker";
import {
  Professor,
  Student,
  Secretary,
  ThesisTopic,
  User,
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

export async function seedThesisTopics(count, professors) {
  const thesisTopics = [];
  for (let i = 0; i < count; i++) {
    const topic = await ThesisTopic.create({
      professorId: professors[Math.floor(Math.random() * professors.length)].id,
      title: faker.lorem.sentence(),
      summary: faker.lorem.paragraph(),
    });
    thesisTopics.push(topic);
  }
  return thesisTopics;
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

  const professors = await seedProfessors(20);
  const students = await seedStudents(50);
  const secretaries = await seedSecretaries(5);
  const thesisTopics = await seedThesisTopics(10, professors);
  console.log("Initial data created successfully");
}
