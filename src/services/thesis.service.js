import db from "../models/index.js";
import { ConflictError, NotFoundError, SecurityError } from "../errors.js";
import { ThesisGradingStatus, ThesisStatus } from "../constants.js";
import { getFilePath } from "../config/file-storage.js";
import { UserRole } from "../constants.js";
import { ThesisRole } from "../constants.js";

export default class ThesisService {
  static async _assertUserHasThesisRoles(
    id,
    user,
    roles,
    allowSecretary = false
  ) {
    const thesis = await ThesisService.get(id);

    const student = await user.getStudent();
    const professor = await user.getProfessor();

    if (user.role === UserRole.SECRETARY && allowSecretary) {
      return thesis;
    }

    const isStudent = student ? thesis.studentId == student.id : false;

    const isSupervisor = professor
      ? await db.CommitteeMember.findOne({
          where: {
            thesisId: thesis.id,
            professorId: professor.id,
            role: ThesisRole.SUPERVISOR,
          },
        })
      : false;

    const isCommitteeMember = professor
      ? await db.CommitteeMember.findOne({
          where: {
            thesisId: thesis.id,
            professorId: professor.id,
            role: ThesisRole.COMMITTEE_MEMBER,
          },
        })
      : false;

    if (
      !(
        (roles.includes(ThesisRole.STUDENT) && isStudent) ||
        (roles.includes(ThesisRole.SUPERVISOR) && isSupervisor) ||
        (roles.includes(ThesisRole.COMMITTEE_MEMBER) && isCommitteeMember)
      )
    ) {
      throw new SecurityError();
    }

    return thesis;
  }

  static async create({ topicId, studentId }) {
    const topic = await db.Topic.findByPk(topicId);
    const student = await db.Student.findByPk(studentId);

    if (!topic) {
      throw new NotFoundError("No such topic.");
    }

    if (!student) {
      throw new NotFoundError("No such student.");
    }

    if (await topic.isAssigned()) {
      throw new ConflictError("Topic is already assigned to a student.");
    }

    if (await student.isAssigned()) {
      throw new ConflictError("Student is already assigned to a thesis.");
    }

    const thesis = await db.Thesis.create({
      topicId: topic.id,
      studentId: student.id,
      status: ThesisStatus.UNDER_ASSIGNMENT,
    });

    // Automatically assign the professor as a supervisor
    await db.CommitteeMember.create({
      thesisId: thesis.id,
      professorId: topic.professorId,
      role: ThesisRole.SUPERVISOR,
    });

    return thesis;
  }

  static async delete(id, user) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.SUPERVISOR,
    ]);

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

  static async getExtra(id, user) {
    await ThesisService._assertUserHasThesisRoles(
      id,
      user,
      [ThesisRole.SUPERVISOR, ThesisRole.STUDENT, ThesisRole.COMMITTEE_MEMBER],
      true // Allow Secretary
    );

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

theses.cancellation_reason AS "cancellationReason",
theses.assembly_year AS "assemblyYear",
theses.assembly_number AS "assemblyNumber",
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
WHERE theses.id = :id
    `;

    const [results] = await db.sequelize.query(rawQuery, {
      replacements: { id },
    });
    const result = results[0];

    if (!result) {
      throw new NotFoundError("No such thesis.");
    }

    const rawQuery2 = `
      SELECT
        committee_members.professor_id AS "professorId",
        committee_members.role AS "role",
        users.name AS "name"
      FROM committee_members
      JOIN professors ON committee_members.professor_id = professors.id
      JOIN users ON professors.user_id = users.id
      WHERE committee_members.thesis_id = :id
    `;

    const [committeeMembers] = await db.sequelize.query(rawQuery2, {
      replacements: { id },
    });
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
      q = q.toLowerCase().replace(/'/g, "''");
      const searchCondition = `(LOWER(topics.title) LIKE '%${q}%' OR LOWER(topics.summary) LIKE '%${q}%' OR LOWER(student_users.name) LIKE '%${q}%' OR LOWER(supervisor_users.name) LIKE '%${q}%' OR LOWER(professor_users.name) LIKE '%${q}%')`;
      whereTemp.push(searchCondition);
    }
    const where = whereTemp.join(" AND ");

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

    const [results] = await db.sequelize.query(rawQuery);
    const total = results.length > 0 ? parseInt(results[0].total) : 0;
    results.forEach((r) => delete r.total);
    return { results, total };
  }

  static async setNemertesLink(id, user, nemertesLink) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.STUDENT,
    ]);

    await thesis.update({ nemertesLink });
    return thesis.nemertesLink;
  }

  static async setGrading(id, user, grading) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.SUPERVISOR,
    ]);

    await thesis.update({ grading });
    return thesis.grading;
  }

  static async getDraftFile(id, user) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.SUPERVISOR,
      ThesisRole.STUDENT,
      ThesisRole.COMMITTEE_MEMBER,
    ]);

    if (!thesis.documentFile) {
      throw new NotFoundError("No draft file");
    }
    return getFilePath(thesis.documentFile);
  }

  static async setDraftFile(id, user, filename) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.STUDENT,
    ]);
    await thesis.update({ documentFile: filename });
  }

  static async complete(id, user) {
    const thesis = await ThesisService.get(id);

    const committeeMembers = await thesis.getCommitteeMembers({
      include: db.Grade,
    });

    const grades = committeeMembers
      .map((member) => member.Grade)
      .filter((grade) => grade !== null);

    if (grades.length !== committeeMembers.length) {
      throw new ConflictError("Not all committee members have graded.");
    }

    const average =
      grades
        .map(
          // Calculate based on CEID regulations
          // https://www.ceid.upatras.gr/sites/default/files/pages/diplomatiki_ergasia_tmiyp_0.pdf
          (grade) =>
            0.6 * grade.objectives +
            0.15 * grade.duration +
            0.15 * grade.deliverableQuality +
            0.1 * grade.presentationQuality
        )
        .reduce((sum, grade) => sum + grade, 0) / grades.length;

    await thesis.update({
      grade: average,
      status: ThesisStatus.COMPLETED,
      endDate: new Date(),
    });

    return thesis.status;
  }

  static async examine(id, user) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.SUPERVISOR,
    ]);
    await thesis.update({ status: ThesisStatus.UNDER_EXAMINATION });
    return thesis.status;
  }

  static async cancel(
    id,
    user,
    { assemblyYear, assemblyNumber, cancellationReason }
  ) {
    const thesis = await ThesisService._assertUserHasThesisRoles(
      id,
      user,
      [ThesisRole.SUPERVISOR],
      true // Allow Secretary
    );

    const now = new Date();

    // Secretary can also cancel and doesn't need to check the 2 years condition
    if (user.role == UserRole.PROFESSOR) {
      const startDate = thesis.startDate;
      const diffYears = (now - startDate) / (1000 * 60 * 60 * 24 * 365.25);

      if (diffYears < 2) {
        throw new ConflictError(
          "Cannot cancel thesis before 2 years from start date."
        );
      }
    }

    await thesis.update({
      status: ThesisStatus.CANCELLED,
      assemblyYear,
      assemblyNumber,
      cancellationReason,
      endDate: now,
    });
    return thesis.status;
  }

  static async getChanges(id, user) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.SUPERVISOR,
      ThesisRole.COMMITTEE_MEMBER,
    ]);

    return await thesis.getThesisChanges({ order: [["changedAt", "ASC"]] });
  }

  static async getResources(id, user) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.SUPERVISOR,
      ThesisRole.STUDENT,
      ThesisRole.COMMITTEE_MEMBER,
    ]);

    return await thesis.getResources({ order: [["id", "ASC"]] });
  }

  static async createResource(id, user, { link, type }) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.STUDENT,
    ]);

    if (thesis.status !== ThesisStatus.UNDER_EXAMINATION) {
      throw new ConflictError("Thesis is not under examination.");
    }

    return await thesis.createResource({
      link,
      type,
    });
  }

  static async getPresentations(id, user) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.SUPERVISOR,
      ThesisRole.STUDENT,
      ThesisRole.COMMITTEE_MEMBER,
    ]);

    return await thesis.getPresentations({ order: [["id", "ASC"]] });
  }

  static async createPresentation(id, user, { date, kind, hall, link }) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.STUDENT,
    ]);

    if (thesis.status !== ThesisStatus.UNDER_EXAMINATION) {
      throw new ConflictError("Thesis is not under examination.");
    }

    // TODO: maybe check for overlapping presentations?
    return await thesis.createPresentation({
      date,
      kind,
      hall,
      link,
    });
  }

  static async getGrades(id, user) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.SUPERVISOR,
      ThesisRole.COMMITTEE_MEMBER,
      ThesisRole.STUDENT,
    ]);

    const grades = await db.Grade.findAll({
      include: [
        {
          model: db.CommitteeMember,
          where: { thesisId: thesis.id },
          attributes: [],
        },
      ],
    });

    return grades;
  }

  static async setGrade(
    id,
    user,
    { objectives, duration, deliverableQuality, presentationQuality }
  ) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.COMMITTEE_MEMBER,
      ThesisRole.SUPERVISOR,
    ]);

    if (thesis.status !== ThesisStatus.UNDER_EXAMINATION) {
      throw new ConflictError("Thesis is not under examination.");
    }

    if (thesis.grading !== ThesisGradingStatus.ENABLED) {
      throw new ConflictError("Grading is not enabled for this thesis.");
    }

    const professor = await user.getProfessor();
    const committeeMember = await db.CommitteeMember.findOne({
      where: {
        thesisId: thesis.id,
        professorId: professor.id,
      },
      include: db.Grade,
    });

    // Create or update the grade
    if (committeeMember.Grade !== null) {
      await db.Grade.update(
        {
          committeeMemberId: committeeMember.professorId,
          objectives,
          duration,
          deliverableQuality,
          presentationQuality,
        },
        {
          where: { committeeMemberId: committeeMember.professorId },
        }
      );
    } else {
      await db.Grade.create({
        committeeMemberId: committeeMember.professorId,
        objectives,
        duration,
        deliverableQuality,
        presentationQuality,
      });
    }

    return await committeeMember.getGrade();
  }

  static async getInvitations(id, user) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.SUPERVISOR,
      ThesisRole.STUDENT,
    ]);

    return await thesis.getInvitations({ order: [["id", "ASC"]] });
  }

  static async createInvitation(id, user, professorId) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.STUDENT,
    ]);

    if (thesis.status !== ThesisStatus.UNDER_ASSIGNMENT) {
      throw new ConflictError("Thesis is not under assignment.");
    }

    const invitations = await thesis.getInvitations({
      where: { professorId },
    });

    if (invitations.length > 0) {
      throw new ConflictError("An identical invitation already exists.");
    }

    return await thesis.createInvitation({ professorId });
  }

  static async getNotes(id, user) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.SUPERVISOR,
      ThesisRole.COMMITTEE_MEMBER,
    ]);

    // NOTE: We do not check role here, cause we have middleware
    const professor = await user.getProfessor();
    return await thesis.getNotes({
      where: { professorId: professor.id },
      order: [["id", "ASC"]],
    });
  }

  static async createNote(id, user, content) {
    const thesis = await ThesisService._assertUserHasThesisRoles(id, user, [
      ThesisRole.SUPERVISOR,
      ThesisRole.COMMITTEE_MEMBER,
    ]);

    if (thesis.status !== ThesisStatus.ACTIVE) {
      throw new ConflictError("Thesis is not active.");
    }

    // NOTE: We do not check role here, cause we have middleware
    const professor = await user.getProfessor();
    return await db.Note.create({
      thesisId: thesis.id,
      professorId: professor.id,
      content,
    });
  }
}
