import db from "../models/index.js";
import { ThesisGradingStatus, UserRole } from "../constants.js";
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

  await TopicService.create(professor, {
    title: "Sample Topic 2",
    summary: "This is a sample topic for testing.",
  });

  await TopicService.create(professor, {
    title: "Sample Topic 3",
    summary: "This is a sample topic for testing.",
  });

  const studentId = (await student.getStudent()).id;
  const thesis = await ThesisService.create({ topicId: topic.id, studentId });

  // Invite 2 professors
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

  // Professors accept the invitation
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

  await ThesisService.examine(thesis.id, professor);

  await ThesisService.setNemertesLink(
    thesis.id,
    student,
    "http://nemertes.library.upatras.gr/handle/123456789/12345"
  );

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

  // await ThesisService.complete(thesis.id, secretary);
  // await seedTopics(400);
  // await seedTheses(300);
  // await seedCommitteeMembers();
}
