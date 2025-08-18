import dotenv from "dotenv";
dotenv.config();

import { StatusCodes } from "http-status-codes";
import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import { sequelize } from "../src/config/database.js";
import User from "../src/models/user.js";
import Professor from "../src/models/professor.js";

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
});

afterAll(async () => {
  await sequelize.close();
});

describe("View and create topics", () => {
  let token;

  it("logins as professor", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        username: "admin",
        password: "admin",
      })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty("token");
    token = response.body.token;
  });

  it("has no topics", async () => {
    const response = await request(app)
      .get("/api/v1/topics")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("creates a topic", async () => {
    const response = await request(app)
      .post("/api/v1/topics")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "New Topic",
        summary: "This is a new topic",
      });
    expect(response.statusCode).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty("id");
    expect(response.body.title).toBe("New Topic");
    expect(response.body.summary).toBe("This is a new topic");
  });

  //   it("Should view all topics", async () => {
  //     const response = await request(app)
  //       .get("/api/v1/topics")
  //       .set("Accept", "application/json")
  //       .set("Authorization", `Bearer ${token}`);
  //     expect(response.statusCode).toBe(StatusCodes.OK);
  //     expect(Array.isArray(response.body)).toBe(true);
  //   });
});
