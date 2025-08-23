import { StatusCodes } from "http-status-codes";
import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import db, { User, Professor, Student } from "../src/models/index.js";
import { UserRole } from "../src/constants.js";

let professorAgent;
let studentAgent;
let professorId;
let studentId;
let topicId;
let thesisId;

async function createProfessorAgent(namepass) {
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

async function createStudentAgent() {
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

async function createProfessor(namepass) {
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

async function createStudent() {
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

beforeAll(async () => {
  await db.sequelize.sync({ force: true });

  professorId = await createProfessor("professor");
  studentId = await createStudent();
  professorAgent = await createProfessorAgent("professor");
  studentAgent = await createStudentAgent();
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("View and create topics", () => {
  it("has no topics", async () => {
    const response = await professorAgent.get("/api/v1/topics");
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it("creates a topic", async () => {
    const response = await professorAgent.post("/api/v1/topics").send({
      title: "New Topic",
      summary: "This is a new topic",
    });
    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty("id");
    expect(response.body.title).toBe("New Topic");
    expect(response.body.summary).toBe("This is a new topic");

    topicId = response.body.id;
  });

  it("lists the topic", async () => {
    const response = await professorAgent.get("/api/v1/topics");
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].id).toBe(topicId);
    expect(response.body[0].title).toBe("New Topic");
    expect(response.body[0].summary).toBe("This is a new topic");
  });

  it("marks the topic as unassigned", async () => {
    let response = await professorAgent
      .get("/api/v1/topics")
      .query({ professorId: professorId, status: "unassigned" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].id).toBe(topicId);

    response = await professorAgent
      .get("/api/v1/topics")
      .query({ professorId: professorId, status: "assigned" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});

describe("Initial topic assignment", () => {
  it("searches students by name or AM", async () => {
    let response = await professorAgent
      .get("/api/v1/students")
      .query({ search: "makis" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(studentId);

    response = await professorAgent
      .get("/api/v1/students")
      .query({ search: "110110" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(studentId);
  });

  it("assigns a topic to a student", async () => {
    const response = await professorAgent.post("/api/v1/theses").send({
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
    let response = await professorAgent
      .get("/api/v1/topics")
      .query({ professorId: professorId, status: "assigned" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].id).toBe(topicId);

    response = await professorAgent
      .get("/api/v1/topics")
      .query({ professorId: professorId, status: "unassigned" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it("un-assigns the topic", async () => {
    let response = await professorAgent
      .delete(`/api/v1/theses/${thesisId}`)
      .send();
    expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);

    response = await professorAgent.get(`/api/v1/theses/${thesisId}`).send();
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("marks the topic as unassigned", async () => {
    let response = await professorAgent
      .get("/api/v1/topics")
      .query({ professorId: professorId, status: "unassigned" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].id).toBe(topicId);

    response = await professorAgent
      .get("/api/v1/topics")
      .query({ professorId: professorId, status: "assigned" });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});

describe("View theses", () => {
  it("lists the professor's theses", async () => {
    let response = await professorAgent
      .get("/api/v1/theses")
      .query({ professorId: professorId });
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it("assigns a topic to a student", async () => {
    const response = await professorAgent.post("/api/v1/theses").send({
      topicId: topicId,
      studentId: studentId,
    });
    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty("id");
    expect(response.body.topicId).toBe(topicId);
    expect(response.body.studentId).toBe(studentId);
    thesisId = response.body.id;
  });
});

describe("View thesis list", () => {
  // TODO
});

describe("Student interaction", () => {
  let professorAId;
  let professorBId;

  beforeAll(async () => {
    professorAId = await createProfessor("professorA");
    professorBId = await createProfessor("professorB");
  });

  it("list the student's thesis", async () => {
    const response = await studentAgent.get(`/api/v1/theses/${thesisId}`);
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body.id).toBe(thesisId);
    expect(response.body.topicId).toBe(topicId);
    expect(response.body.studentId).toBe(studentId);
  });

  it("invites other professors to the committee", async () => {
    let response = await studentAgent
      .post(`/api/v1/theses/${thesisId}/invitations`)
      .send({
        professorId: professorAId,
      });
    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty("id");
    expect(response.body.thesisId).toBe(thesisId);
    expect(response.body.professorId).toBe(professorAId);

    response = await studentAgent
      .post(`/api/v1/theses/${thesisId}/invitations`)
      .send({
        professorId: professorBId,
      });
    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty("id");
    expect(response.body.thesisId).toBe(thesisId);
    expect(response.body.professorId).toBe(professorBId);
  });

  it("rejects duplicate invitations", async () => {
    const response = await studentAgent
      .post(`/api/v1/theses/${thesisId}/invitations`)
      .send({
        professorId: professorAId,
      });
    expect(response.statusCode).toBe(StatusCodes.CONFLICT);
  });

  it("lists the invitations", async () => {
    const response = await studentAgent
      .get(`/api/v1/theses/${thesisId}/invitations`)
      .send();
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
  });
});
