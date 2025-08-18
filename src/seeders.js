import { faker } from "@faker-js/faker";
import {
  Professor,
  Student,
  Secretary,
  Topic,
  User,
  Thesis,
  CommitteeMember,
} from "./models/index.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { ThesisRole, ThesisStatus, UserRole } from "./constants.js";

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
  const statuses = Object.values(ThesisStatus);
  return statuses[Math.floor(Math.random() * statuses.length)];
}

export async function seedProfessors(count) {
  for (let i = 0; i < count; i++) {
    const user = await User.create({
      username: faker.internet.username(),
      password: await bcrypt.hash("password", 10),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: UserRole.PROFESSOR,
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
      role: UserRole.STUDENT,
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
      role: UserRole.SECRETARY,
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

export async function seedCommitteeMembers() {
  const professors = await Professor.findAll();
  const theses = await Thesis.findAll({
    where: {
      status: {
        [Op.notIn]: [ThesisStatus.REJECTED, ThesisStatus.PENDING],
      },
    },
  });

  for (const thesis of theses) {
    const memberCount = Math.floor(Math.random() * 3) + 1;
    const shuffledProfessors = professors
      .map((prof) => prof.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, memberCount);

    for (const professorId of shuffledProfessors) {
      await CommitteeMember.create({
        thesisId: thesis.id,
        professorId: professorId,
        role: ThesisRole.COMMITTEE_MEMBER,
        startDate: faker.date.past(),
      });
    }
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
    if (status === ThesisStatus.REJECTED) {
      statusReason = "APO GRAMMATEIA";
      endDate = faker.date.past();
    }

    if (status === ThesisStatus.CANCELLED) {
      statusReason = "Cancelled by student";
      faker.date.past();
    }

    if (status == ThesisStatus.PENDING) {
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
    role: UserRole.PROFESSOR,
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

  await seedCommitteeMembers();
}
