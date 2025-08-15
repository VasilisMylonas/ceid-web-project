import { StatusCodes } from "http-status-codes";
import { CommitteeMember, Thesis } from "../models/index.js";
import { getFilePath, deleteIfExists } from "../config/file-storage.js";

export async function queryTheses(req, res) {
  let query = {
    attributes: ["id", "status", "topicId", "studentId"],
    limit: req.query.limit,
    offset: req.query.offset,
    order: [["id", "ASC"]],
    where: {
      ...(req.query.studentId && { studentId: req.query.studentId }),
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.topicId && { topicId: req.query.topicId }),
    },
  };

  if (req.query.professorId) {
    query.include = [
      {
        model: CommitteeMember,
        attributes: [],
        where: {
          professorId: req.query.professorId,
          ...(req.query.role && { role: req.query.role }),
        },
      },
    ];
  }

  const theses = await Thesis.findAll(query);
  res.status(StatusCodes.OK).json(theses);
}

export async function getThesis(req, res) {
  const thesis = req.thesis.toJSON();
  delete thesis.documentFile;
  res.status(StatusCodes.OK).json(thesis);
}

export async function patchThesis(req, res) {
  await req.thesis.update(req.body);
  res.status(StatusCodes.OK).json(req.thesis);
}

export async function deleteThesis(req, res) {
  await req.thesis.destroy();
  res.status(StatusCodes.NO_CONTENT).send();
}

export async function putThesisDocument(req, res) {
  if (!req.file) {
    return res.status(StatusCodes.BAD_REQUEST).send();
  }

  deleteIfExists(req.thesis.documentFile);
  req.thesis.documentFile = req.file.filename;
  await req.thesis.save();

  res.status(StatusCodes.CREATED).send();
}

export async function getThesisDocument(req, res) {
  if (!req.thesis.documentFile) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  res.sendFile(getFilePath(req.thesis.documentFile));
}

export async function getThesisTimeline(req, res) {
  // TODO
}

export async function getThesisNotes(req, res) {
  // TODO
}

export async function getThesisResources(req, res) {
  // TODO
}

export async function getThesisPresentations(req, res) {
  // TODO
}

export async function getThesisInvitations(req, res) {
  // TODO
}

export async function postThesisNotes(req, res) {
  // TODO
}

export async function postThesisResources(req, res) {
  // TODO
}

export async function postThesisPresentations(req, res) {
  // TODO
}

export async function postThesisInvitations(req, res) {
  // TODO
}
