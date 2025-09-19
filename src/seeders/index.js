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

  const professor = await UserService.create({
    username: "professor",
    password: "professor",
    email: "professor@example.com",
    name: "Test Professor",
    role: UserRole.PROFESSOR,
    phone: "6942023594",
    address: "ADDRESS",
    division: "Software Engineering",
  });

  const professor2 = await UserService.create({
    username: "professor2",
    password: "professor2",
    email: "professor2@example.com",
    name: "Test Professor 2",
    role: UserRole.PROFESSOR,
    phone: "6942023594",
    address: "ADDRESS",
    division: "Software Engineering",
  });

  const professor3 = await UserService.create({
    username: "professor3",
    password: "professor3",
    email: "professor3@example.com",
    name: "Test Professor 3",
    role: UserRole.PROFESSOR,
    phone: "6942023594",
    address: "ADDRESS",
    division: "Software Engineering",
  });

  const professor4 = await UserService.create({
    username: "professor4",
    password: "professor4",
    email: "professor4@example.com",
    name: "Test Professor 4",
    role: UserRole.PROFESSOR,
    phone: "6942023594",
    address: "ADDRESS",
    division: "Software Engineering",
  });

  const professor5 = await UserService.create({
    username: "professor5",
    password: "professor5",
    email: "professor5@example.com",
    name: "Test Professor 5",
    role: UserRole.PROFESSOR,
    phone: "6942023594",
    address: "ADDRESS",
    division: "Software Engineering",
  });

  const student = await UserService.create({
    username: "student",
    password: "student",
    email: "student@example.com",
    name: "Test Student",
    role: UserRole.STUDENT,
    phone: "6942023594",
    address: "ADDRESS",
    am: "0",
  });

  const student2 = await UserService.create({
    username: "student2",
    password: "student2",
    email: "student2@example.com",
    name: "Test Student 2",
    role: UserRole.STUDENT,
    phone: "6942023594",
    address: "ADDRESS",
    am: "2",
  });

  const student3 = await UserService.create({
    username: "student3",
    password: "student3",
    email: "student3@example.com",
    name: "Test Student 3",
    role: UserRole.STUDENT,
    phone: "6942023594",
    address: "ADDRESS",
    am: "3",
  });

  const student4 = await UserService.create({
    username: "student4",
    password: "student4",
    email: "student4@example.com",
    name: "Test Student 4",
    role: UserRole.STUDENT,
    phone: "6942023594",
    address: "ADDRESS",
    am: "4",
  });

  const secretary = await UserService.create({
    username: "secretary",
    password: "secretary",
    email: "secretary@example.com",
    name: "Test Secretary",
    role: UserRole.SECRETARY,
    phone: "6942023594",
    address: "ADDRESS",
  });

  const topic = await TopicService.create(professor, {
    title: "Sample Topic 1",
    summary: "This is a sample topic for testing.",
  });

  const topic2 = await TopicService.create(professor, {
    title: "Sample Topic 2",
    summary: "This is a sample topic for testing.",
  });

  const topic3 = await TopicService.create(professor, {
    title: "Sample Topic 3",
    summary: "This is a sample topic for testing.",
  });

  const topic4 = await TopicService.create(professor, {
    title: "Sample Topic 4",
    summary: "This is a sample topic for testing.",
  });

  const studentId = (await student.getStudent()).id;

  const studentId2 = (await student2.getStudent()).id;
  const studentId3 = (await student3.getStudent()).id;
  const studentId4 = (await student4.getStudent()).id;

  const thesis = await ThesisService.create({ topicId: topic.id, studentId });

  const thesis2 = await ThesisService.create({
    topicId: topic2.id,
    studentId: studentId2,
  });
  const thesis3 = await ThesisService.create({
    topicId: topic3.id,
    studentId: studentId3,
  });
  const thesis4 = await ThesisService.create({
    topicId: topic4.id,
    studentId: studentId4,
  });

  const inv1 = await ThesisService.createInvitation(
    thesis.id,
    student,
    professor2.id
  );
  const inv2 = await ThesisService.createInvitation(
    thesis.id,
    student,
    professor3.id
  );
  const inv3 = await ThesisService.createInvitation(
    thesis3.id,
    student3,
    professor.id
  );
  const inv4 = await ThesisService.createInvitation(
    thesis4.id,
    student4,
    professor.id
  );

  await InvitationService.respond(
    inv1.id,
    professor2,
    InvitationResponse.ACCEPTED
  );
  await InvitationService.respond(
    inv2.id,
    professor3,
    InvitationResponse.ACCEPTED
  );

  // await ThesisService.cancel(thesis.id, secretary, {
  //   assemblyNumber: "2024/1",
  //   cancellationReason: "Just for testing",
  // });

  await ThesisService.approve(thesis.id, secretary, {
    assemblyNumber: "2025/1",
    protocolNumber: "123/2024",
  });

  await ThesisService.examine(thesis.id, professor);

  await ThesisService.setGrading(
    thesis.id,
    professor,
    ThesisGradingStatus.ENABLED
  );

  await ThesisService.setGrade(thesis.id, professor, {
    objectives: 8,
    duration: 9,
    deliverableQuality: 7,
    presentationQuality: 10,
  });

  await ThesisService.setGrade(thesis.id, professor2, {
    objectives: 6,
    duration: 9,
    deliverableQuality: 5,
    presentationQuality: 8,
  });

  await ThesisService.setGrade(thesis.id, professor3, {
    objectives: 7,
    duration: 8,
    deliverableQuality: 6,
    presentationQuality: 9,
  });

  await ThesisService.setNemertesLink(
    thesis.id,
    student,
    "http://nemertes.library.upatras.gr/handle/123456789/12345"
  );

  // await ThesisService.createPresentation(thesis.id, student, {
  //   date: new Date("2025-09-18T12:00:00"),
  //   hall: "Αίθουσα 1",
  //   kind: PresentationKind.IN_PERSON,
  // });

  // await ThesisService.complete(thesis.id, secretary);

  // await seedTopics(400);
  // await seedTheses(300);
  // await seedCommitteeMembers();
}
