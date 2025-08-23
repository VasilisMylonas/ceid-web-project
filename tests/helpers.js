import request from "supertest";
import bcrypt from "bcrypt";

import { User, Professor, Student } from "../src/models/index.js";
import app from "../src/app.js";
import { UserRole } from "../src/constants.js";

export async function createProfessorAgent(namepass) {
  const agent = request.agent(app);
  const response = await agent
    .post("/api/v1/auth/login")
    .send({
      username: namepass,
      password: namepass,
    })
    .set("Accept", "application/json");

  agent.set("Authorization", `Bearer ${response.body.token}`);
  agent.set("Accept", "application/json");
  return agent;
}

export async function createStudentAgent() {
  const agent = request.agent(app);
  const response = await agent
    .post("/api/v1/auth/login")
    .send({
      username: "student",
      password: "student",
    })
    .set("Accept", "application/json");
  agent.set("Authorization", `Bearer ${response.body.token}`);
  agent.set("Accept", "application/json");
  return agent;
}

export async function createProfessor(namepass) {
  const professor = await User.create({
    username: namepass,
    password: await bcrypt.hash(namepass, 10),
    role: UserRole.PROFESSOR,
    email: `${namepass}@upatras.gr`,
    phone: "000",
  });

  await Professor.create({
    id: professor.id,
    division: "Computer Science",
  });

  return professor.id;
}

export async function createStudent() {
  const student = await User.create({
    username: "student",
    name: "Makis",
    password: await bcrypt.hash("student", 10),
    role: UserRole.STUDENT,
    email: "student@upatras.gr",
    phone: "000",
  });

  await Student.create({
    id: student.id,
    am: "110110",
  });

  return student.id;
}
