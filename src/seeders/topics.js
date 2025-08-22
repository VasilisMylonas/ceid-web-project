import db from "../models/index.js";
import { faker } from "@faker-js/faker";

export default async function seedTopics(count = 20) {
  const professors = await db.Professor.findAll();
  for (let i = 0; i < count; i++) {
    await db.Topic.create({
      title: faker.lorem.sentence(),
      summary: faker.lorem.paragraph(),
      professorId: professors[Math.floor(Math.random() * professors.length)].id,
    });
  }
}
