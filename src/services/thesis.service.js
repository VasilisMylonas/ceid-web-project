import db from "../models/index.js";
import { ConflictError, NotFoundError, SecurityError } from "../errors.js";
import { ThesisStatus } from "../constants.js";
import { getFilePath, deleteIfExists } from "../config/file-storage.js";

export default class ThesisService {
  static async create({ topicId, studentId }) {
    const topic = await db.Topic.findByPk(topicId);
    const student = await db.Student.findByPk(studentId);

    if (!topic) {
      throw new NotFoundError("No such topic.");
    }

    if (!student) {
      throw new NotFoundError("No such student.");
    }

    return await db.Thesis.createFrom({ topic, student });
  }

  static async delete(id) {
    const thesis = await ThesisService.get(id);

    if (!(await thesis.canBeDeleted())) {
      throw new ConflictError("Thesis cannot be deleted at this stage.");
    }

    await db.CommitteeMember.destroy({ where: { thesisId: id } });
    await db.Invitation.destroy({ where: { thesisId: id } });
    await thesis.destroy();
  }

  static async get(id) {
    const thesis = await db.Thesis.findByPk(id);
    if (!thesis) {
      throw new NotFoundError("No such thesis.");
    }
    return thesis;
  }

  static async getExtra(id) {
    const rawQuery = `
  SELECT
theses.id AS "id",
theses.status AS "status",
theses.start_date AS "startDate",
topics.id AS "topicId",
topics.title AS "topic",
student_users.name AS "student",
students.id AS "studentId",
supervisor_users.name AS "supervisor",
supervisors.id AS "supervisorId",

theses.status_reason AS "statusReason",
theses.end_date AS "endDate",
theses.protocol_number AS "protocolNumber",
theses.grading AS "grading",
topics.summary AS "topicSummary"

FROM theses
JOIN topics ON theses.topic_id = topics.id

JOIN students ON theses.student_id = students.id
JOIN users AS student_users ON students.user_id = student_users.id

JOIN committee_members AS supervisor_members ON theses.id = supervisor_members.thesis_id AND supervisor_members.role = 'supervisor'
JOIN professors AS supervisors ON supervisor_members.professor_id = supervisors.id
JOIN users AS supervisor_users ON supervisors.user_id = supervisor_users.id

JOIN committee_members ON theses.id = committee_members.thesis_id
JOIN professors ON committee_members.professor_id = professors.id
JOIN users AS professor_users ON professors.user_id = professor_users.id
WHERE theses.id = '${id}'
    `;

    const [results] = await db.sequelize.query(rawQuery);
    const result = results[0];

    if (!result) {
      throw new NotFoundError("No such thesis.");
    }

    const rawQuery2 = `
      SELECT
        committee_members.professor_id AS "professorId",
        committee_members.role AS "role",
        committee_members.start_date AS "startDate",
        committee_members.end_date AS "endDate",
        users.name AS "name"
      FROM committee_members
      JOIN professors ON committee_members.professor_id = professors.id
      JOIN users ON professors.user_id = users.id
      WHERE committee_members.thesis_id = '${id}'
    `;

    const [committeeMembers] = await db.sequelize.query(rawQuery2);
    result.committeeMembers = committeeMembers;

    return result;
  }

  static async query({
    studentId,
    status,
    topicId,
    professorId,
    role,
    q,
    limit,
    offset,
  }) {
    let wherePairs = {
      "students.id": studentId,
      "theses.status": status,
      "topics.id": topicId,
      "professors.id": professorId,
      "committee_members.role": role,
    };
    const whereTemp = Object.entries(wherePairs)
      .filter(([_, value]) => {
        return value !== undefined;
      })
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `(${key} IN (${value.map((v) => `'${v}'`).join(", ")}))`;
        } else {
          return `${key} = '${value}'`;
        }
      });

    if (q) {
      const q = q.toLowerCase().replace(/'/g, "''");
      const searchCondition = `(LOWER(topics.title) LIKE '%${q}%' OR LOWER(topics.summary) LIKE '%${q}%' OR LOWER(student_users.name) LIKE '%${q}%' OR LOWER(supervisor_users.name) LIKE '%${q}%' OR LOWER(professor_users.name) LIKE '%${q}%')`;
      whereTemp.push(searchCondition);
    }
    const where = whereTemp.join(" AND ");

    const raw_query = `
    SELECT
theses.id AS "id",
theses.status AS "status",
theses.start_date AS "startDate",
topics.id AS "topicId",
topics.title AS "topic",
student_users.name AS "student",
students.id AS "studentId",
supervisor_users.name AS "supervisor",
supervisors.id AS "supervisorId",

COUNT(*) OVER() AS "total"

FROM theses
JOIN topics ON theses.topic_id = topics.id

JOIN students ON theses.student_id = students.id
JOIN users AS student_users ON students.user_id = student_users.id

JOIN committee_members AS supervisor_members ON theses.id = supervisor_members.thesis_id AND supervisor_members.role = 'supervisor'
JOIN professors AS supervisors ON supervisor_members.professor_id = supervisors.id
JOIN users AS supervisor_users ON supervisors.user_id = supervisor_users.id

JOIN committee_members ON theses.id = committee_members.thesis_id
JOIN professors ON committee_members.professor_id = professors.id
JOIN users AS professor_users ON professors.user_id = professor_users.id

${where ? `WHERE ${where}` : ""}
GROUP BY theses.id, topics.id, supervisor_users.id, supervisors.id, student_users.id, students.id
ORDER BY theses.id ASC
${limit ? `LIMIT ${limit}` : ""}
${offset ? `OFFSET ${offset}` : ""}
`;

    const [results, _] = await db.sequelize.query(raw_query);
    const total = results.length > 0 ? parseInt(results[0].total) : 0;
    results.forEach((r) => delete r.total);
    return { results, total };
  }

  static async setNemertesLink(id, nemertesLink) {
    const thesis = await ThesisService.get(id);
    if (thesis.status !== ThesisStatus.UNDER_EXAMINATION) {
      throw new ConflictError("Thesis is not under examination.");
    }
    await thesis.update({ nemertesLink });
    return thesis.nemertesLink;
  }

  static async setGrading(id, grading) {
    const thesis = await ThesisService.get(id);
    if (thesis.status !== ThesisStatus.UNDER_EXAMINATION) {
      throw new ConflictError("Thesis is not under examination.");
    }
    await thesis.update({ grading });
    return thesis.grading;
  }

  static async getDraftFile(id) {
    const thesis = await ThesisService.get(id);
    if (!thesis.documentFile) {
      throw new NotFoundError("No draft file");
    }
    return getFilePath(thesis.documentFile);
  }

  static async setDraftFile(id, filename) {
    const thesis = await ThesisService.get(id);
    if (thesis.status !== ThesisStatus.ACTIVE) {
      throw new ConflictError("Thesis is not active.");
    }
    deleteIfExists(thesis.documentFile);
    await thesis.update({ documentFile: filename });
  }
}
