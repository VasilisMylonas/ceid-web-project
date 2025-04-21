import request from "supertest";
import { app, server } from "../src/server.js";
import { sequelize } from "../src/config/db.js";
import User from "../src/models/User.js";
import { StatusCodes } from "http-status-codes";

describe("Auth API - Login", () => {
  beforeAll(async () => {
    await User.create({
      username: "admin",
      password: "admin",
      email: "test@test.com",
      role: "admin",
    });
  });

  afterAll(async () => {
    server.close();
    await sequelize.close();
  });

  it("should return a token for valid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "admin",
    });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty("token");
  });

  it("should not return a token for invalid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "wrongpassword",
    });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body).not.toHaveProperty("token");
  });

  it("should be invalid to have username or password is missing", async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "test",
    });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
