import request from "supertest";
import bcrypt from "bcrypt";

import db from "../models/index.js";
import api from "../api.js";
import { UserRole } from "../constants.js";

export async function createProfessorAgent(namepass) {
  const agent = request.agent(api);
  const response = await agent
    .post("/v1/auth/login")
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
  const agent = request.agent(api);
  const response = await agent
    .post("/v1/auth/login")
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
  const user = await db.User.create({
    username: namepass,
    name: "Name",
    password: await bcrypt.hash(namepass, 10),
    role: UserRole.PROFESSOR,
    email: `${namepass}@upatras.gr`,
    phone: "000",
  });

  const professor = await db.Professor.create({
    userId: user.id,
    division: "Computer Science",
  });

  return professor.id;
}

export async function createStudent() {
  const user = await db.User.create({
    username: "student",
    name: "Makis",
    password: await bcrypt.hash("student", 10),
    role: UserRole.STUDENT,
    email: "student@upatras.gr",
    phone: "000",
  });

  const student = await db.Student.create({
    userId: user.id,
    am: "110110",
  });

  return student.id;
}
