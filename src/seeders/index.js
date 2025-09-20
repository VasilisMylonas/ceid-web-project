import db from "../models/index.js";
import {
  PresentationKind,
  InvitationResponse,
  UserRole,
  ThesisStatus,
} from "../constants.js";
import UserService from "../services/user.service.js";
import TopicService from "../services/topic.service.js";
import ThesisService from "../services/thesis.service.js";
import InvitationService from "../services/invitation.service.js";
import { faker } from "@faker-js/faker";

// >= 10 students
// >= 5 professors
// >= 1 secretary
const STUDENT_COUNT = 30;
const PROFESSOR_COUNT = 10;
const SECRETARY_COUNT = 2;
const TOPICS_PER_PROFESSOR = 10;
const INVITATIONS_PER_THESIS_MAX = 5;
const STUDENT_NO_THESIS_PROB = 0.1;
const THESIS_APPROVAL_PROB = 0.7;
const THESIS_EXAMINATION_PROB = 0.5;
const THESIS_PRESENTATION_PROB = 0.5;

async function seedUsers() {
  let students = [];

  for (let i = 0; i < STUDENT_COUNT; i++) {
    students.push(
      UserService.create({
        username: `student${i}`,
        password: `student${i}`,
        email: `student${i}@example.com`,
        name: `Student ${i}`,
        role: UserRole.STUDENT,
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        am: `${i + 10000}`,
      })
    );
  }

  let professors = [];

  for (let i = 0; i < PROFESSOR_COUNT; i++) {
    professors.push(
      UserService.create({
        username: `professor${i}`,
        password: `professor${i}`,
        email: `professor${i}@example.com`,
        name: `Professor ${i}`,
        role: UserRole.PROFESSOR,
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        division: "Software Engineering",
      })
    );
  }

  let secretaries = [];

  for (let i = 0; i < SECRETARY_COUNT; i++) {
    secretaries.push(
      UserService.create({
        username: `secretary${i}`,
        password: `secretary${i}`,
        email: `secretary${i}@example.com`,
        name: `Secretary ${i}`,
        role: UserRole.SECRETARY,
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
      })
    );
  }

  // Wait to resolve promises
  students = await Promise.all(students);
  professors = await Promise.all(professors);
  secretaries = await Promise.all(secretaries);

  return { students, professors, secretaries };
}

async function seedTopics(professors) {
  const topics = [];

  for (const professor of professors) {
    for (let i = 0; i < TOPICS_PER_PROFESSOR; i++) {
      topics.push(
        TopicService.create(professor, {
          title: `Sample Topic ${topics.length}`,
          summary: "This is a sample topic for testing.",
        })
      );
    }
  }

  // Wait to resolve promises
  return await Promise.all(topics);
}

async function seedTheses(students, freeTopics) {
  const theses = [];

  for (const student of students) {
    if (Math.random() < STUDENT_NO_THESIS_PROB) {
      continue;
    }

    // Assign a random topic
    const topic =
      freeTopics[
        Math.min(
          Math.floor(Math.random() * freeTopics.length),
          freeTopics.length - 1
        )
      ];
    const professor = await topic.getProfessor();

    const thesis = await ThesisService.create(await professor.getUser(), {
      topicId: topic.id,
      studentId: student.id,
    });

    // Remove topic from free topics
    const index = freeTopics.findIndex((t) => t.id === topic.id);
    if (index !== -1) {
      freeTopics.splice(index, 1);
    }

    theses.push(thesis);
  }

  return theses;
}

async function seedInvitations(thesis, professors) {
  const student = await thesis.getStudent().then((s) => s.getUser());

  const supervisor = await thesis
    .getTopic()
    .then((t) => t.getProfessor())
    .then((p) => p.getUser());

  // Get professors excluding the supervisor
  const freeProfessors = professors.filter((p) => p.id != supervisor.id);

  const invitationCount = Math.floor(
    Math.random() * INVITATIONS_PER_THESIS_MAX
  );
  const invitations = [];

  for (let i = 0; i < invitationCount && i < freeProfessors.length; i++) {
    const invitation = await ThesisService.createInvitation(
      thesis.id,
      student,
      (
        await freeProfessors[i].getProfessor()
      ).id
    );
    invitations.push(invitation);
  }

  let acceptedCount = 0;

  // Randomly accept/reject invitations
  for (const invitation of invitations) {
    const rand = Math.random();
    const professor = await invitation.getProfessor().then((p) => p.getUser());

    if (acceptedCount >= 2) {
      break; // Already have enough committee members
    }

    if (rand < 0.85) {
      acceptedCount++;
      await InvitationService.respond(
        invitation.id,
        professor,
        InvitationResponse.ACCEPTED
      );
    } else if (rand < 0.95) {
      await InvitationService.respond(
        invitation.id,
        professor,
        InvitationResponse.DECLINED
      );
    }
  }

  await thesis.reload();
}

export default async function seedDatabase() {
  // Initialize DB
  await db.sequelize.sync({ force: true });

  const { students, professors, secretaries } = await seedUsers();

  const topics = await seedTopics(professors);

  const freeTopics = [...topics];
  const theses = await seedTheses(students, freeTopics);

  for (const thesis of theses) {
    await seedInvitations(thesis, professors);

    const secretary = secretaries[0];

    if (
      thesis.status === ThesisStatus.ACTIVE &&
      Math.random() < THESIS_APPROVAL_PROB
    ) {
      await ThesisService.approve(thesis.id, secretary, {
        assemblyNumber: `2023-${Math.floor(Math.random() * 100)}`,
        protocolNumber: `${Math.floor(Math.random() * 10000)}`,
      });

      await thesis.reload();

      const supervisor = await thesis
        .getTopic()
        .then((t) => t.getProfessor())
        .then((p) => p.getUser());

      const student = await thesis.getStudent().then((s) => s.getUser());

      if (Math.random() < THESIS_EXAMINATION_PROB) {
        await ThesisService.examine(thesis.id, supervisor);
        await thesis.reload();

        // TODO: 1 year?
        if (Math.random() < THESIS_PRESENTATION_PROB) {
          await ThesisService.setPresentation(thesis.id, student, {
            date: faker.date.future({ years: 1 }),
            hall: `Hall ${Math.floor(Math.random() * 5) + 1}`,
            kind:
              Math.random() < 0.5
                ? PresentationKind.IN_PERSON
                : PresentationKind.ONLINE,
            link:
              Math.random() < 0.5
                ? "https://example.com/presentation-link"
                : null,
          });
        }
      }
    }
  }

  console.log("Seeding completed.");
  console.log(`Created ${students.length} students.`);
  console.log(`Created ${professors.length} professors.`);
  console.log(`Created ${secretaries.length} secretaries.`);
  console.log(`Created ${topics.length} topics.`);
  console.log(`Assigned ${topics.length - freeTopics.length} topics.`);
  console.log(`Created ${theses.length} theses.`);
}
