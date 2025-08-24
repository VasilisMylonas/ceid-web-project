import { CommitteeMember, Thesis } from "../models/index.js";
import { ThesisRole } from "../constants.js";
import { StatusCodes } from "http-status-codes";

export function requireThesisRole(...roles) {
  return async (req, res, next) => {
    const thesis =
      req.thesis instanceof Thesis ? req.model : await req.model.getThesis();

    const student = await thesis.getStudent();
    const professor = await (await thesis.getTopic()).getProfessor();

    const isStudent = student ? thesis.studentId == student.id : false;

    const isSupervisor = professor
      ? await CommitteeMember.findOne({
          where: {
            thesisId: thesis.id,
            professorId: professor.id,
            role: ThesisRole.SUPERVISOR,
            endDate: null,
          },
        })
      : false;

    if (
      !(roles.includes(ThesisRole.STUDENT) && isStudent) &&
      !(roles.includes(ThesisRole.SUPERVISOR) && isSupervisor) &&
      roles.length != 0
    ) {
      return res.status(StatusCodes.FORBIDDEN).send();
    }

    req.isStudent = !!isStudent;
    req.isSupervisor = !!isSupervisor;
    req.thesis = thesis;
    next();
  };
}

export function requireThesisStatus(...status) {
  return async (req, res, next) => {
    const thesis =
      req.thesis instanceof Thesis ? req.model : await req.model.getThesis();

    if (!status.includes(thesis.status)) {
      return res.status(StatusCodes.BAD_REQUEST).send();
    }

    req.thesis = thesis;
    next();
  };
}
