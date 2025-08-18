import dotenv from "dotenv";
dotenv.config();

import { StatusCodes } from "http-status-codes";
import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import { sequelize } from "../src/config/database.js";
import { User, Professor, Student } from "../src/models/index.js";

let agent;
let professorId;
let studentId;
let topicId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const professor = await User.create({
    username: "professor",
    password: await bcrypt.hash("professor", 10),
    role: "professor",
    email: "professor@upatras.gr",
  });

  const student = await User.create({
    username: "student",
    password: await bcrypt.hash("student", 10),
    role: "student",
    email: "student@upatras.gr",
  });

  await Professor.create({
    id: professor.id,
    division: "Computer Science",
  });

  await Student.create({
    id: student.id,
  });

  professorId = professor.id;
  studentId = student.id;
  agent = request.agent(app);
});

afterAll(async () => {
  await sequelize.close();
});

describe("View and create topics", () => {
  it("logins as professor", async () => {
    const response = await agent
      .post("/api/v1/auth/login")
      .send({
        username: "professor",
        password: "professor",
      })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty("token");

    agent.set("Authorization", `Bearer ${response.body.token}`);
    agent.set("Accept", "application/json");
  });

  it("has no topics", async () => {
    const response = await agent.get("/api/v1/topics");
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("creates a topic", async () => {
    const response = await agent.post("/api/v1/topics").send({
      title: "New Topic",
      summary: "This is a new topic",
    });
    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty("id");
    expect(response.body.title).toBe("New Topic");
    expect(response.body.summary).toBe("This is a new topic");

    topicId = response.body.id;
  });

  it("lists all topics", async () => {
    const response = await agent.get("/api/v1/topics");
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].id).toBe(topicId);
    expect(response.body[0].title).toBe("New Topic");
    expect(response.body[0].summary).toBe("This is a new topic");
  });

  it("assigns a topic to a student", async () => {
    const response = await agent.post("/api/v1/theses").send({
      topicId: topicId,
      studentId: studentId,
    });
    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty("id");
    expect(response.body.topicId).toBe(topicId);
    expect(response.body.studentId).toBe(studentId);
  });
});
