import dotenv from "dotenv";
dotenv.config();

import { StatusCodes } from "http-status-codes";
import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import { sequelize } from "../src/config/database.js";
import User from "../src/models/user.js";
import Professor from "../src/models/professor.js";

let agent;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const user = await User.create({
    username: "admin",
    password: await bcrypt.hash("admin", 10),
    role: "professor",
    email: "email@example.com",
  });
  await Professor.create({
    userId: user.id,
    division: "Computer Science",
  });

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
        username: "admin",
        password: "admin",
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
  });

  it("lists all topics", async () => {
    const response = await agent.get("/api/v1/topics");
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
