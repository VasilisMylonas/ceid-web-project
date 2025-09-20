import db from "../models/index.js";
import {
  PresentationKind,
  ThesisGradingStatus,
  UserRole,
} from "../constants.js";
import seedProfessors from "./professors.js";
import seedStudents from "./students.js";
import seedSecretaries from "./secretaries.js";
import seedTopics from "./topics.js";
import seedTheses from "./theses.js";
import seedCommitteeMembers from "./committee-members.js";
import UserService from "../services/user.service.js";
import TopicService from "../services/topic.service.js";
import ThesisService from "../services/thesis.service.js";
import InvitationService from "../services/invitation.service.js";
import { InvitationResponse } from "../constants.js";

export default async function seedDatabase() {
  await db.sequelize.sync({ force: true });

  // await Promise.all([
  //   seedProfessors(30),
  //   seedStudents(500),
  //   seedSecretaries(4),
  // ]);

  const students = [];

  for (let i = 0; i < 20; i++) {
    students.push(
      await UserService.create({
        username: `student${i}`,
        password: `student${i}`,
        email: `student${i}@example.com`,
        name: `Student ${i}`,
        role: UserRole.STUDENT,
        phone: "6942023594",
        address: "ADDRESS",
        am: `${i + 10000}`,
      })
    );
  }

  const professors = [];

  for (let i = 0; i < 10; i++) {
    professors.push(
      await UserService.create({
        username: `professor${i}`,
        password: `professor${i}`,
        email: `professor${i}@example.com`,
        name: `Professor ${i}`,
        role: UserRole.PROFESSOR,
        phone: "6942023594",
        address: "ADDRESS",
        division: "Software Engineering",
      })
    );
  }

  const secretary = await UserService.create({
    username: "secretary",
    password: "secretary",
    email: "secretary@example.com",
    name: "Test Secretary",
    role: UserRole.SECRETARY,
    phone: "6942023594",
    address: "ADDRESS",
  });

  const topics = [];

  for (const professor of professors) {
    for (let j = 0; j < 5; j++) {
      topics.push(
        await TopicService.create(professor, {
          title: `Sample Topic ${topics.length}`,
          summary: "This is a sample topic for testing.",
        })
      );
    }
  }

  const theses = [];

  const assignedStudents = students.slice(0, 4);

  const thesis = await ThesisService.create(professors[0], {
    topicId: topics[0].id,
    studentId: assignedStudents[0].id,
  });

  const inv1 = await ThesisService.createInvitation(
    thesis.id,
    students[0],
    (
      await professors[1].getProfessor()
    ).id
  );

  const inv2 = await ThesisService.createInvitation(
    thesis.id,
    students[0],
    (
      await professors[2].getProfessor()
    ).id
  );

  await InvitationService.respond(
    inv1.id,
    professors[1],
    InvitationResponse.ACCEPTED
  );

  await InvitationService.respond(
    inv2.id,
    professors[2],
    InvitationResponse.ACCEPTED
  );

  await ThesisService.approve(thesis.id, secretary, {
    assemblyNumber: "2023-01",
    protocolNumber: "12345",
  });

  await ThesisService.examine(thesis.id, professors[0]);

  await ThesisService.createPresentation(thesis.id, students[0], {
    date: new Date("2025-09-18T12:00:00"),
    hall: "Αίθουσα 1",
    kind: PresentationKind.IN_PERSON,
  });

  // await ThesisService.complete(thesis.id, secretary);
}
