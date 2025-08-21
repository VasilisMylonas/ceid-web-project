import { StatusCodes } from "http-status-codes";
import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import db, { User, Professor, Student } from "../src/models/index.js";
import { UserRole } from "../src/constants.js";

let agent;
let professorId;
let studentId;
let topicId;
let thesisId;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
  const professor = await User.create({
    username: "professor",
    password: await bcrypt.hash("professor", 10),
    role: UserRole.PROFESSOR,
    email: "professor@upatras.gr",
    phone: "000",
  });

  const student = await User.create({
    username: "student",
    name: "Makis",
    password: await bcrypt.hash("student", 10),
    role: UserRole.STUDENT,
    email: "student@upatras.gr",
    phone: "000",
  });

  await Professor.create({
    id: professor.id,
    division: "Computer Science",
  });

  await Student.create({
    id: student.id,
    am: "110110",
  });

  professorId = professor.id;
  studentId = student.id;
  agent = request.agent(app);
});

afterAll(async () => {
  await db.sequelize.close();
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
    expect(response.body.length).toBe(0);
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

  it("marks the topic as unassigned", async () => {
    let response = await agent
      .get("/api/v1/topics")
      .query({ professorId: professorId, status: "unassigned" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].id).toBe(topicId);

    response = await agent
      .get("/api/v1/topics")
      .query({ professorId: professorId, status: "assigned" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it("searches students by name or AM", async () => {
    let response = await agent
      .get("/api/v1/students")
      .query({ search: "makis" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(studentId);

    response = await agent.get("/api/v1/students").query({ search: "110110" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(studentId);
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

    thesisId = response.body.id;
  });

  it("marks the topic as assigned", async () => {
    let response = await agent
      .get("/api/v1/topics")
      .query({ professorId: professorId, status: "assigned" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].id).toBe(topicId);

    response = await agent
      .get("/api/v1/topics")
      .query({ professorId: professorId, status: "unassigned" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it("un-assigns the topic", async () => {
    let response = await agent.delete(`/api/v1/theses/${thesisId}`).send();
    expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);

    response = await agent.get(`/api/v1/theses/${thesisId}`).send();
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
