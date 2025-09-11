import { faker } from "@faker-js/faker";
import db from "../models/index.js";
import { ThesisRole, ThesisStatus } from "../constants.js";

export default async function seedCommitteeMembers() {
  const theses = await db.Thesis.findAll();
  const professors = await db.Professor.findAll();

  for (const thesis of theses) {
    const isUnderAssignment = thesis.status === ThesisStatus.UNDER_ASSIGNMENT;

    const topic = await thesis.getTopic();
    const supervisor = await topic.getProfessor();

    // Shuffle professors to get random members
    const shuffledProfessors = faker.helpers.shuffle(professors);

    // Remove supervisor from potential members
    const index = shuffledProfessors.findIndex((p) => p.id === supervisor.id);
    shuffledProfessors.splice(index, 1);

    // Add supervisor
    await db.CommitteeMember.create({
      thesisId: thesis.id,
      professorId: supervisor.id,
      role: ThesisRole.SUPERVISOR,
    });

    const memberCount = isUnderAssignment
      ? faker.number.int({ min: 0, max: 1 })
      : 2;

    for (let i = 0; i < memberCount; i++) {
      const member = shuffledProfessors[i];
      await db.CommitteeMember.create({
        thesisId: thesis.id,
        professorId: member.id,
        role: ThesisRole.MEMBER,
      });
    }
  }
}
