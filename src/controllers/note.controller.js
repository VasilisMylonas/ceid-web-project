import { StatusCodes } from "http-status-codes";

export async function getNote(req, res) {
  res.status(StatusCodes.OK).json(req.note);
}

export async function deleteNote(req, res) {
  await req.note.destroy();
  res.status(StatusCodes.NO_CONTENT).send();
}

export async function patchNote(req, res) {
  const { content } = req.body;
  if (content) {
    req.note.content = content;
  }
  await req.note.save();
  res.status(StatusCodes.OK).json(req.note);
}
