import { faker } from "@faker-js/faker";
import db from "../models/index.js";
import { ThesisStatus } from "../constants.js";

export default async function seedTheses(count) {
  const students = await db.Student.findAll();
  const topics = await db.Topic.findAll();
  for (let i = 0; i < count; i++) {
    const protocolNumber = `PN-${faker.string.numeric(6)}`;
    const status = [...Object.values(ThesisStatus)][
      Math.floor(Math.random() * Object.values(ThesisStatus).length)
    ];

    let endDate = faker.date.future();
    let statusReason = null;

    if (status === ThesisStatus.CANCELLED) {
      statusReason = "Cancelled by student";
      endDate = faker.date.past();
    }

    if (status == ThesisStatus.UNDER_ASSIGNMENT) {
      endDate = null;
    }

    await db.Thesis.create({
      title: faker.lorem.sentence(),
      summary: faker.lorem.paragraph(),
      studentId: students[i].id,
      topicId: topics[i].id,
      status: status,
      statusReason: statusReason,
      protocolNumber: protocolNumber,
      startDate: faker.date.past(),
      endDate: endDate,
    });
  }
}
