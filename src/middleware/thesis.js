import db from "../models/index.js";
import { ThesisRole, UserRole } from "../constants.js";
import { StatusCodes } from "http-status-codes";

export function requireThesisRoleOrSecretary(...roles) {
  return async (req, res, next) => {
    if (req.user.role === UserRole.SECRETARY) {
      return next();
    }

    requireThesisRole(...roles)(req, res, next);
  };
}

export function requireThesisRole(...roles) {
  return async (req, res, next) => {
    const thesis =
      req.thesis instanceof db.Thesis ? req.model : await req.model.getThesis();

    const student = await req.user.getStudent();
    const professor = await req.user.getProfessor();

    const isStudent = student ? thesis.studentId == student.id : false;

    const isSupervisor = professor
      ? await db.CommitteeMember.findOne({
          where: {
            thesisId: thesis.id,
            professorId: professor.id,
            role: ThesisRole.SUPERVISOR,
            endDate: null,
          },
        })
      : false;

    if (
      !(
        (roles.includes(ThesisRole.STUDENT) && isStudent) ||
        (roles.includes(ThesisRole.SUPERVISOR) && isSupervisor) ||
        roles.length == 0
      )
    ) {
      return res.status(StatusCodes.FORBIDDEN).json();
    }

    req.isStudent = !!isStudent;
    req.isSupervisor = !!isSupervisor;
    req.thesis = thesis;

    console.log("SUPERVISOR", req.isSupervisor);
    console.log("STUDENT", req.isStudent);

    next();
  };
}
