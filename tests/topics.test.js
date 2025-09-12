import { StatusCodes } from "http-status-codes";
import db from "../src/models/index.js";
import { createProfessorAgent, createProfessor } from "./helpers.js";

describe("Topics Endpoints", () => {
  let agent;
  let professor;

  beforeAll(async () => {
    try {
      if (!process.env.NODE_ENV || process.env.NODE_ENV !== "test") {
        throw new Error("NODE_ENV must be set to 'test' for running tests");
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET must be set for running tests");
      }

      await db.sequelize.sync({ force: true }); // Reset database

      professor = await createProfessor("professor1");
      agent = await createProfessorAgent("professor1");
    } catch (error) {
      console.error("Setup error:", error);
      throw error;
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test("POST /topics should create a new topic", async () => {
    const topicData = {
      title: "New Topic",
      summary: "New summary",
    };

    const res = await agent.post("/v1/topics").send(topicData);
    expect(res.statusCode).toBe(StatusCodes.CREATED);
    expect(res.body.data.title).toBe(topicData.title);
    expect(res.body.data.summary).toBe(topicData.summary);
    expect(res.body.data.professorId).toBe(professor.id);
  });

  test("GET /topics/:id should return a topic by id", async () => {
    const topic = await db.Topic.create({
      title: "Find Me",
      summary: "Find summary",
      professorId: professor.id,
    });
    const res = await agent.get(`/v1/topics/${topic.id}`);
    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.body.data.title).toBe("Find Me");
  });

  test("GET /topics should return all topics", async () => {
    await db.Topic.create({
      title: "Topic 1",
      summary: "Summary 1",
      professorId: professor.id,
    });
    await db.Topic.create({
      title: "Topic 2",
      summary: "Summary 2",
      professorId: professor.id,
    });
    const res = await agent.get("/v1/topics");
    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  test("PUT /topics/:id should update a topic", async () => {
    const topic = await db.Topic.create({
      title: "Old Title",
      summary: "Old Summary",
      professorId: professor.id,
    });
    const updatedData = {
      title: "Updated Title",
      summary: "Updated Summary",
    };
    const res = await agent.put(`/v1/topics/${topic.id}`).send(updatedData);
    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.body.data.title).toBe(updatedData.title);
    expect(res.body.data.summary).toBe(updatedData.summary);
  });

  test("DELETE /topics/:id should delete a topic", async () => {
    const topic = await db.Topic.create({
      title: "Delete Me",
      summary: "Delete Summary",
      professorId: professor.id,
    });
    const res = await agent.delete(`/v1/topics/${topic.id}`);
    expect(res.statusCode).toBe(StatusCodes.NO_CONTENT);

    const found = await db.Topic.findByPk(topic.id);
    expect(found).toBeNull();
  });

  test("POST /topics should fail with missing title", async () => {
    const topicData = {
      summary: "Missing title",
    };
    const res = await agent.post("/v1/topics").send(topicData);
    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test("POST /topics should fail with missing summary", async () => {
    const topicData = {
      title: "Missing summary",
    };
    const res = await agent.post("/v1/topics").send(topicData);
    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test("GET /topics/:id should fail with invalid id", async () => {
    const res = await agent.get("/v1/topics/999999");
    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  test("PUT /topics/:id should fail with invalid id", async () => {
    const updatedData = {
      title: "Should Not Update",
      summary: "Invalid ID",
    };
    const res = await agent.put("/v1/topics/999999").send(updatedData);
    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  test("DELETE /topics/:id should fail with invalid id", async () => {
    const res = await agent.delete("/v1/topics/999999");
    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  // TODO
  //   test("POST /topics should trim title and summary", async () => {
  //     const topicData = {
  //       title: "   Trimmed Title   ",
  //       summary: "   Trimmed Summary   ",
  //     };
  //     const res = await agent.post("/v1/topics").send(topicData);
  //     expect(res.statusCode).toBe(StatusCodes.CREATED);
  //     expect(res.body.data.title).toBe(topicData.title.trim());
  //     expect(res.body.data.summary).toBe(topicData.summary.trim());
  //   });

  test("GET /topics should support pagination", async () => {
    // Create extra topics for pagination
    for (let i = 0; i < 5; i++) {
      await db.Topic.create({
        title: `Paginated Topic ${i}`,
        summary: `Paginated Summary ${i}`,
        professorId: professor.id,
      });
    }
    const res = await agent.get("/v1/topics?limit=3&offset=2");
    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
  });

  test("PUT /topics/:id should not update professorId", async () => {
    const topic = await db.Topic.create({
      title: "Professor Test",
      summary: "Professor Summary",
      professorId: professor.id,
    });

    // Try to update professorId
    const res = await agent.put(`/v1/topics/${topic.id}`).send({
      title: "Professor Test Updated",
      summary: "Professor Summary Updated",
      professorId: professor.id + 1,
    });

    topic.reload();

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(topic.professorId).toBe(professor.id);
  });

  test("GET /topics should filter by professorId", async () => {
    const otherProfessor = await createProfessor("professor2");
    await db.Topic.create({
      title: "Other Professor Topic",
      summary: "Other Summary",
      professorId: otherProfessor.id,
    });
    const res = await agent.get(`/v1/topics?professorId=${otherProfessor.id}`);
    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(
      res.body.data.every((t) => t.professorId === otherProfessor.id)
    ).toBe(true);
  });

  test("GET /topics should return empty array if no topics", async () => {
    await db.Topic.destroy({ where: {} });
    const res = await agent.get("/v1/topics");
    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});
