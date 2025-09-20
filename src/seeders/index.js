import db from "../models/index.js";
import {
  PresentationKind,
  ThesisGradingStatus,
  InvitationResponse,
  UserRole,
  ThesisStatus,
} from "../constants.js";
import UserService from "../services/user.service.js";
import TopicService from "../services/topic.service.js";
import ThesisService from "../services/thesis.service.js";
import InvitationService from "../services/invitation.service.js";
import { faker } from "@faker-js/faker";

async function seedUsers(studentCount, professorCount, secretaryCount) {
  let students = [];

  for (let i = 0; i < studentCount; i++) {
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

  for (let i = 0; i < professorCount; i++) {
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

  for (let i = 0; i < secretaryCount; i++) {
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

async function seedTopics(professors, maxTopicsPerProfessor) {
  const topics = [];

  for (const professor of professors) {
    // [0, maxTopicsPerProfessor] random
    const count = Math.floor(Math.random() * maxTopicsPerProfessor) + 1;

    for (let i = 0; i < count; i++) {
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
    // Each student has a 25% chance of not having a thesis
    if (Math.random() < 0.25) {
      continue;
    }

    // Assign a random topic
    const topic = freeTopics[Math.floor(Math.random() * freeTopics.length)];
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

  // Send 2-4 invitations
  const invitationCount = Math.floor(Math.random() * 3) + 2;
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
      // Skip if already 2 accepted
      break;
    }

    if (rand < 0.6) {
      // 60% chance of accepting
      acceptedCount++;
      await InvitationService.respond(
        invitation.id,
        professor,
        InvitationResponse.ACCEPTED
      );
    } else if (rand < 0.9) {
      // 30% chance of rejecting
      await InvitationService.respond(
        invitation.id,
        professor,
        InvitationResponse.DECLINED
      );
    } // 10% chance of no response
  }
}

export default async function seedDatabase() {
  // Initialize DB
  await db.sequelize.sync({ force: true });

  // >= 10 students
  // >= 5 professors
  // >= 1 secretary
  const STUDENT_COUNT = 20;
  const PROFESSOR_COUNT = 10;
  const SECRETARY_COUNT = 2;
  const TOPICS_PER_PROFESSOR_MAX = 5;

  const { students, professors, secretaries } = await seedUsers(
    STUDENT_COUNT,
    PROFESSOR_COUNT,
    SECRETARY_COUNT
  );

  const topics = await seedTopics(professors, TOPICS_PER_PROFESSOR_MAX);

  const freeTopics = [...topics];
  const theses = await seedTheses(students, freeTopics);

  for (const thesis of theses) {
    await seedInvitations(thesis, professors);

    const secretary = secretaries[0];

    const invitations = await thesis.getInvitations({
      where: { response: InvitationResponse.ACCEPTED },
    });

    if (thesis.status === ThesisStatus.ACTIVE) {
      // 80% chance of being approved if active
      if (Math.random() < 0.8) {
        await ThesisService.approve(thesis.id, secretary, {
          assemblyNumber: `2023-${Math.floor(Math.random() * 100)}`,
          protocolNumber: `${Math.floor(Math.random() * 10000)}`,
        });
      }

      // Randomly examine the thesis (75% chance)
      if (Math.random() < 0.75) {
        await ThesisService.examine(thesis.id, professors[0]);
      }
    }

    // TODO
    //   // Randomly create a presentation (50% chance)
    //   if (Math.random() < 0.5) {
    //     const presentation = await ThesisService.createPresentation(
    //       thesis.id,
    //       student,
    //       {
    //         date: faker.date.future({ years: 1 }),
    //         hall: `Hall ${Math.floor(Math.random() * 5) + 1}`,
    //         kind:
    //           Math.random() < 0.5
    //             ? PresentationKind.IN_PERSON
    //             : PresentationKind.ONLINE,
    //         link:
    //           Math.random() < 0.5
    //             ? "https://example.com/presentation-link"
    //             : null,
    //       }
    //     );

    //     // Randomly complete the thesis (75% chance)
    //     if (Math.random() < 0.75) {
    //       await ThesisService.complete(thesis.id, secretary, {
    //         grade: Math.floor(Math.random() * 5) + 6, // Grade between 6 and 10
    //         gradingStatus: ThesisGradingStatus.PASSED,
    //         remarks: "Well done.",
    //       });
    //     }
    //   }
    // }
  }

  console.log("Seeding completed.");
  console.log(`Created ${students.length} students.`);
  console.log(`Created ${professors.length} professors.`);
  console.log(`Created ${secretaries.length} secretaries.`);
  console.log(`Created ${topics.length} topics.`);
  console.log(`Assigned ${topics.length - freeTopics.length} topics.`);
  console.log(`Created ${theses.length} theses.`);
}
