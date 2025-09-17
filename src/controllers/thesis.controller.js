import { StatusCodes } from "http-status-codes";
import db from "../models/index.js";
import { getFilePath, deleteIfExists } from "../config/file-storage.js";
import { ThesisStatus, UserRole } from "../constants.js";

export default class ThesisController {
  static async post(req, res) {
    const topic = await db.Topic.findByPk(req.body.topicId);
    const student = await db.Student.findByPk(req.body.studentId);

    if (!topic) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No such topic." });
    }

    if (!student) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No such student." });
    }

    try {
      const thesis = await db.Thesis.createFrom({
        topic: topic,
        student: student,
      });
      res.status(StatusCodes.CREATED).json(thesis);
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }

  static async patchGrading(req, res) {
    await req.thesis.update({ grading: req.body.grading });
    res.status(StatusCodes.OK).json(req.thesis);
  }

  static async delete(req, res) {
    if (!req.isSupervisor) {
      // TODO: secretary can also delete
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Only the supervisor can delete the thesis.",
      });
    }

    if (!(await req.thesis.canBeDeleted())) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thesis cannot be deleted at this stage.",
      });
    }

    db.CommitteeMember.destroy({
      where: { thesisId: req.thesis.id },
    });
    db.Invitation.destroy({
      where: { thesisId: req.thesis.id },
    });

    await req.thesis.destroy();
    return res.status(StatusCodes.NO_CONTENT).json();
  }

  static async getNotes(req, res) {
    const professor = await req.user.getProfessor();
    const notes = await req.thesis.getNotes({
      where: { professorId: professor.id },
      order: [["id", "ASC"]],
    });

    res.success(notes, { count: notes.length, total: notes.length });
  }

  static async postNote(req, res) {
    const professor = await req.user.getProfessor();
    const note = await db.Note.create({
      thesisId: req.thesis.id,
      professorId: professor.id,
      content: req.body.content,
    });
    res.success(note);
  }

  static async getInvitations(req, res) {
    const invitations = await req.thesis.getInvitations({
      order: [["id", "ASC"]],
    });
    res.status(StatusCodes.OK).json(invitations);
  }

  static async postInvitation(req, res) {
    const invitations = await db.Invitation.findAll({
      where: {
        thesisId: req.thesis.id,
        professorId: req.body.professorId,
      },
    });

    if (invitations.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "An identical invitation already exists.",
      });
    }

    const invitation = await db.Invitation.create({
      thesisId: req.thesis.id,
      professorId: req.body.professorId,
    });
    res.status(StatusCodes.CREATED).json(invitation);
  }

  static async cancel(req, res) {
    // TODO: this is wrong
    const thesis = req.thesis;

    if (thesis.status !== ThesisStatus.ACTIVE) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Thesis cannot be cancelled at this stage." });
    }

    const startDate = thesis.startDate;
    const now = new Date();
    const diffYears = (now - startDate) / (1000 * 60 * 60 * 24 * 365.25);

    if (diffYears < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Cannot cancel thesis before 2 years from start date.",
      });
    }

    thesis.status = ThesisStatus.CANCELLED;
    thesis.endDate = now;

    await thesis.save();

    return res.status(StatusCodes.OK).json(req.thesis);
  }

  static async patchStatus(req, res) {
    // TODO: this is wrong

    switch (req.body.status) {
      case ThesisStatus.UNDER_EXAMINATION: {
        if (req.user.role !== UserRole.PROFESSOR) {
          return res.status(StatusCodes.FORBIDDEN).json({
            message: "Only professors can set thesis under examination.",
          });
        }

        if (req.thesis.status !== ThesisStatus.ACTIVE) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Thesis is not active." });
        }

        req.thesis.status = ThesisStatus.UNDER_EXAMINATION;
        await req.thesis.save();

        return res.status(StatusCodes.OK).json(req.thesis);
      }
      case ThesisStatus.COMPLETED: {
        if (req.user.role !== UserRole.SECRETARY) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "Only secretaries can complete theses." });
        }

        if (req.thesis.status !== ThesisStatus.UNDER_EXAMINATION) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Thesis is not under examination.",
          });
        }

        req.thesis.status = ThesisStatus.COMPLETED;
        req.thesis.endDate = new Date();
        await req.thesis.save();

        return res.status(StatusCodes.OK).json(req.thesis);
      }
      case ThesisStatus.REJECTED: {
        if (req.user.role !== UserRole.SECRETARY) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "Only secretaries can review theses." });
        }

        if (req.thesis.status !== ThesisStatus.PENDING) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Thesis is not pending review.",
          });
        }

        req.thesis.status = ThesisStatus.REJECTED;
        await req.thesis.save();

        return res.status(StatusCodes.OK).json(req.thesis);
      }
      case ThesisStatus.ACTIVE: {
        if (req.user.role !== UserRole.SECRETARY) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "Only secretaries can review theses." });
        }

        if (req.thesis.status !== ThesisStatus.PENDING) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Thesis is not pending review.",
          });
        }

        req.thesis.status = ThesisStatus.ACTIVE;
        req.thesis.startDate = new Date();
        await req.thesis.save();

        return res.status(StatusCodes.OK).json(req.thesis);
      }
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
  }

  static async getDraft(req, res) {
    if (!req.thesis.documentFile) {
      return res.status(StatusCodes.NOT_FOUND).json();
    }
    res.status(StatusCodes.OK).sendFile(getFilePath(req.thesis.documentFile));
  }

  static async putDraft(req, res) {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json();
    }

    if (!req.thesis.status === ThesisStatus.ACTIVE) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Thesis is not active." });
    }

    deleteIfExists(req.thesis.documentFile);
    req.thesis.documentFile = req.file.filename;
    await req.thesis.save();

    res.status(StatusCodes.NO_CONTENT).json();
  }

  static async query(req, res) {
    let wherePairs = {
      "students.id": req.query.studentId,
      "theses.status": req.query.status,
      "topics.id": req.query.topicId,
      "professors.id": req.query.professorId,
      "committee_members.role": req.query.role,
    };

    const whereTemp = Object.entries(wherePairs)
      .filter(([key, value]) => value !== undefined) // Remove undefined values
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `(${key} IN (${value.map((v) => `'${v}'`).join(", ")}))`;
        }

        return `${key} = '${value}'`; // Create condition strings
      });

    if (req.query.q) {
      const q = req.query.q.toLowerCase().replace(/'/g, "''");
      const searchCondition = `(LOWER(topics.title) LIKE '%${q}%' OR LOWER(topics.summary) LIKE '%${q}%' OR LOWER(student_users.name) LIKE '%${q}%' OR LOWER(supervisor_users.name) LIKE '%${q}%' OR LOWER(professor_users.name) LIKE '%${q}%')`;
      whereTemp.push(searchCondition);
    }

    const where = whereTemp.join(" AND "); // Join conditions with AND

    // This query is complicated due to the need to join multiple tables and filter based on various criteria.
    // So we use a raw SQL query here.
    // Nothing beats raw SQL for complex queries...
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
${req.query.limit ? `LIMIT ${req.query.limit}` : ""}
${req.query.offset ? `OFFSET ${req.query.offset}` : ""}
`;

    console.log(raw_query);

    const [results, _] = await db.sequelize.query(raw_query);

    // console.log(results);

    // Get the count and remove it from the records
    const total = results.length > 0 ? parseInt(results[0].total) : 0;
    results.forEach((r) => delete r.total);

    res.success(results, { count: results.length, total });
  }

  static async get(req, res) {
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
WHERE theses.id = '${req.thesis.id}'
    `;

    const [results, _] = await db.sequelize.query(raw_query);
    const thesis = results[0];

    // Get committee members
    thesis.committeeMembers = await req.thesis.getCommitteeMembers({
      raw: true,
      attributes: [
        "professorId",
        "role",
        "startDate",
        "endDate",
        [db.sequelize.col("Professor.User.name"), "name"],
      ],
      include: [
        {
          model: db.Professor,
          attributes: [],
          include: [{ model: db.User, attributes: [] }],
        },
      ],
    });

    res.success(thesis);
  }

  static async putNemertesLink(req, res) {
    if (req.thesis.status !== ThesisStatus.UNDER_EXAMINATION) {
      return res.error("Thesis is not under examination.");
    }

    await req.thesis.update({ nemertesLink: req.body.nemertesLink });

    res.success({
      nemertesLink: req.thesis.nemertesLink,
    });
  }

  static async getResources(req, res) {
    const resources = await req.thesis.getResources({
      order: [["id", "ASC"]],
    });
    res.success(resources, {
      count: resources.length,
      total: resources.length,
    });
  }

  static async getPresentations(req, res) {
    const presentations = await req.thesis.getPresentations({
      order: [["id", "ASC"]],
    });
    res.success(presentations, {
      count: presentations.length,
      total: presentations.length,
    });
  }

  static async postResource(req, res) {
    const resource = await db.Resource.create({
      thesisId: req.thesis.id,
      link: req.body.link,
      type: req.body.type,
    });

    res.success(resource);
  }

  static async postPresentation(req, res) {
    // TODO: maybe check for overlapping presentations?

    const presentation = await db.Presentation.create({
      thesisId: req.thesis.id,
      date: req.body.date,
      kind: req.body.kind,
      hall: req.body.hall,
      link: req.body.link,
    });

    res.success(presentation);
  }
}
