import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../models/index.js";
import bcrypt from "bcrypt";
import { UserRole } from "../constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await db.sequelize.sync({ force: true });

const files = fs
  .readdirSync(__dirname)
  .filter((f) => f.endsWith(".js") && f !== path.basename(__filename));

for (const file of files) {
  const module = await import(path.join(__dirname, file));
  await module.up();
}

const adminUser = await db.User.create({
  id: 1,
  username: "admin",
  password: await bcrypt.hash("admin", 10),
  email: "example@email.com",
  name: "Vasilis Mylonas",
  role: UserRole.PROFESSOR,
  phone: "6942023594",
});

await db.Professor.create({
  id: adminUser.id,
  division: "Hardware Engineering",
});

// export async function seedTopics(count) {
//   const professors = await Professor.findAll();
//   for (let i = 0; i < count; i++) {
//     await Topic.create({
//       professorId: professors[Math.floor(Math.random() * professors.length)].id,
//       title: faker.lorem.sentence(),
//       summary: faker.lorem.paragraph(),
//     });
//   }
// }

// export async function seedCommitteeMembers() {
//   const professors = await Professor.findAll();
//   const theses = await Thesis.findAll({
//     where: {
//       status: {
//         [Op.notIn]: [ThesisStatus.REJECTED, ThesisStatus.PENDING],
//       },
//     },
//   });

//   for (const thesis of theses) {
//     const memberCount = Math.floor(Math.random() * 3) + 1;
//     const shuffledProfessors = professors
//       .map((prof) => prof.id)
//       .sort(() => 0.5 - Math.random())
//       .slice(0, memberCount);

//     for (const professorId of shuffledProfessors) {
//       await CommitteeMember.create({
//         thesisId: thesis.id,
//         professorId: professorId,
//         role: ThesisRole.COMMITTEE_MEMBER,
//         startDate: faker.date.past(),
//       });
//     }
//   }
// }

// export async function seedTheses(count) {
//   const students = await Student.findAll();
//   const topics = await Topic.findAll();
//   for (let i = 0; i < count; i++) {
//     const protocolNumber = `PN-${faker.string.numeric(6)}`;
//     const status = getRandomStatus();

//     let endDate = faker.date.future();
//     let statusReason = null;
//     if (status === ThesisStatus.REJECTED) {
//       statusReason = "APO GRAMMATEIA";
//       endDate = faker.date.past();
//     }

//     if (status === ThesisStatus.CANCELLED) {
//       statusReason = "Cancelled by student";
//       faker.date.past();
//     }

//     if (status == ThesisStatus.PENDING) {
//       endDate = null;
//     }

//     await Thesis.create({
//       title: faker.lorem.sentence(),
//       summary: faker.lorem.paragraph(),
//       studentId: students[Math.floor(Math.random() * students.length)].id,
//       topicId: topics[Math.floor(Math.random() * topics.length)].id,
//       status: status,
//       statusReason: statusReason,
//       protocolNumber: protocolNumber,
//       startDate: faker.date.past(),
//       endDate: endDate,
//     });
//   }
// }

// export async function seedData() {
//   const adminUser = await User.create({
//     username: "admin",
//     password: await bcrypt.hash("admin", 10),
//     email: "example@email.com",
//     name: "Vasilis Mylonas",
//     role: UserRole.PROFESSOR,
//   });

//   await Professor.create({
//     id: adminUser.id,
//     division: "Hardware Engineering",
//   });

//   await Promise.all([
//     seedProfessors(30),
//     seedStudents(300),
//     seedSecretaries(5),
//   ]);

//   await seedTopics(50);
//   await seedTheses(50);

//   await seedCommitteeMembers();
// }
